import { Database } from "sqlite3"

type EventRow = {
  event: string,
  timestamp: string
}

export type Event = {
  type: string,
  payload: any
}

export type ParsedEvent = Event & {
  timestamp: string
}

function database(location: string) {
  const db = new Database(`${location}/card-db.db`)
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

export async function events(db: Database, aggregate: string): Promise<ParsedEvent[]> {
  const rows = await query<EventRow[]>(db, "SELECT event, timestamp FROM Events WHERE aggregate LIKE ?", [aggregate])
  return rows.map(row => ({ ...JSON.parse(row.event), timestamp: row.timestamp }))
}

export function ensureEventsDBCreated(location: string): Database {
  return database(location)
}
