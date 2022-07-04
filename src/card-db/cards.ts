import fs from 'fs'
import { Database } from 'sqlite3'
import { sleep } from './sleep'
import { events, Event, insertEvent } from './events'
import uniqid from 'uniqid'

type Card = {
  id: string,
  name: string,
  image: string
}

type CardCreatedEvent = {
  type: "card_created",
  payload: {
    id: string,
    image: string
  }
}

function card_created(cards: Card[], event: Event): Card[] {
  return [
    ...cards,
    {
      id: event.payload.id,
      name: "No name set",
      image: event.payload.image
    }
  ]
}

type Handler = (cards: Card[], event: Event) => Card[]

const handlers: { [eventType: string]: Handler } = {
  "card_created": card_created
}

function handler(eventType: string): Handler {
  const result = handlers[eventType]
  if (result) return result
  return (cards, _event) => cards
}

function onEvent(cards: Card[], event: Event): Card[] {
  return handler(event.type)(cards, event)
}

export async function cards(db: Database): Promise<Card[]> {
  const cardEvents = await events(db, "card")
  return cardEvents.reduce(onEvent, [])
}

export async function card(db: Database, id: string): Promise<Card> {
  const result = (await cards(db)).find(card => card.id === id)
  if (!result) throw new Error(`Could not find card with id: ${id}`)
  return result
}

export async function createCard(db: Database, image: string): Promise<Card> {
  const id = uniqid()
  const event: CardCreatedEvent = {
    type: "card_created",
    payload: {
      id,
      image: '/' + image
    }
  }
  await insertEvent(db, "card", event)
  return card(db, id)
}

// Loops through existing image pairs and adds cards into database if missing
async function processImagePairs(db: Database) {
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
