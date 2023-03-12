import { Database } from 'sqlite3'
import { insertEvent, ParsedEvent } from '../events'
import uniqid from 'uniqid'
import { Card } from './card'

type CardCreatedEvent = {
  type: "card_created",
  payload: { id: string }
}

export async function createCard(db: Database) {
  const id = uniqid()
  const event: CardCreatedEvent = {
    type: "card_created",
    payload: { id }
  }
  return insertEvent(db, "card", event)
}

export function card_created(cards: Card[], event: ParsedEvent): Card[] {
  return [
    ...cards,
    {
      id: event.payload.id,
      name: "No name set",
      createdAt: event.timestamp,
      emissions: -1,
      language: "none"
    }
  ]
}
