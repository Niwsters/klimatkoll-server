import { Database } from "sqlite3"

type EventRow = {
  event: string
}

export type Event = {
  type: string,
  payload: any
}

function database() {
  const db = new Database('card-db.db')
  db.exec(`CREATE TABLE IF NOT EXISTS Events (
    id INTEGER NOT NULL PRIMARY KEY,
    timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    aggregate TEXT NOT NULL,
    event TEXT NOT NULL
  )`)
  return db
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

export async function insertEvent(db: Database, aggregate: string, event: Event) {
  await exec(db, "INSERT INTO Events (aggregate, event) VALUES (?, ?)", [aggregate, JSON.stringify(event)])
}

export async function events(db: Database, aggregate: string): Promise<Event[]> {
  const rows = await query<EventRow[]>(db, "SELECT event FROM Events WHERE aggregate LIKE ?", [aggregate])
  return rows.map(row => JSON.parse(row.event))
}

export function ensureEventsDBCreated(): Database {
  return database()
}
