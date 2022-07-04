import fs from 'fs'
import { Database } from 'sqlite3'
import { sleep } from './sleep'

type Card = {
  name: string,
  image: string
}

type EventRow = {
  event: string
}

type Event = {
  type: string,
  payload: any
}

function database() {
  const db = new Database(':memory:')
  db.exec(`CREATE TABLE IF NOT EXISTS Events (
    id INTEGER NOT NULL PRIMARY KEY,
    timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    aggregate TEXT NOT NULL,
    event TEXT NOT NULL
  )`)
  return db
}

async function events(db: Database, aggregate: string): Promise<Event[]> {
  const rows = await query<EventRow[]>(db, "SELECT event FROM Events WHERE aggregate LIKE ?", [aggregate])
  return rows.map(row => JSON.parse(row.event))
}

export function ensureCardDBCreated(): Database {
  return database()
}

async function query<T>(db: Database, sql: string, params: any[] = []): Promise<T> {
  return new Promise<any>((resolve, reject) => {
    db.all(sql, params, (err, result) => {
      if (err)
        reject(err)

      resolve(result)
    })
  })
}

async function exec(db: Database, sql: string, params: any[] = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, err => {
      if (err) reject(err)
      resolve(null)
    })
  })
}

function card_created(cards: Card[], event: Event): Card[] {
  return [
    ...cards,
    {
      name: event.payload.name,
      image: event.payload.image
    }
  ]
}

type Handler = (cards: Card[], event: Event) => Card[]

const handlers: { [eventType: string]: Handler } = {
  "card_created": card_created
}

function onEvent(cards: Card[], event: Event): Card[] {
  const handler = handlers[event.type]
  if (handler) return handler(cards, event)
  return cards
}

export async function cards(db: Database): Promise<Card[]> {
  const cardEvents = await events(db, "card")
  return cardEvents.reduce(onEvent, [])
}

export async function card(db: Database, name: string): Promise<Card> {
  const result = (await cards(db)).find(card => card.name === name)
  if (!result) throw new Error(`Could not find card with name: ${name}`)
  return result
}

export async function createCard(db: Database, image: string): Promise<Card> {
  const name = image.replace(/.png$/, '')
  const event = {
    type: "card_created",
    payload: {
      name,
      image: '/' + image
    }
  }
  await exec(db, "INSERT INTO Events (aggregate, event) VALUES (?, ?)", ["card", JSON.stringify(event)])
  return card(db, name)
}

// Loops through existing image pairs and adds cards into database if missing
export async function processImagePairs(db: Database) {
  const existing = (await cards(db)).map(card => card.image.replace(/^\//, ''))
  const pairs = fs.readdirSync("./pairs")
  pairs
    .filter(pair => !existing.includes(pair))
    .forEach(async (pair) => await createCard(db, pair))
}

export async function startProcessingImagePairs(db: Database) {
  while (true) {
    await processImagePairs(db)
    await sleep(1000)
  }
}
