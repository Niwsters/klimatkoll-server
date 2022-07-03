import fs from 'fs'
import { Database } from 'sqlite3'
import { sleep } from './sleep'

type Card = {
  name: string,
  image: string
}

function database() {
  const db = new Database(':memory:')
  db.exec("CREATE TABLE IF NOT EXISTS Cards (name TEXT UNIQUE, image TEXT UNIQUE, emissions REAL)")
  return db
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

export async function cards(db: Database): Promise<Card[]> {
  return await query<Card[]>(db, "SELECT name, image FROM Cards")
}

export async function card(db: Database, name: string): Promise<Card> {
  const result = await query<Card[]>(db, "SELECT name, image FROM Cards WHERE name = ?", [name])
  return result[0]
}

export async function createCard(db: Database, src: string): Promise<Card> {
  const name = src.replace(/.png$/, '')
  await exec(db, "INSERT INTO Cards (name, image) VALUES (?, ?)", [name, '/' + src])
  return card(db, src)
}

// Loops through existing image pairs and adds cards into database if missing
export async function processImagePairs(db: Database) {
  const existing = (await query<Card[]>(db, "SELECT image FROM Cards")).map(card => card.image.replace(/^\//, ''))
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
