import { Database } from 'sqlite3'
import { insertEvent } from '../events'
import uniqid from 'uniqid'
import { Card } from './card'
import { Event } from '../events'

type CardCreatedEvent = {
  type: "card_created",
  payload: {
    id: string,
    image: string
  }
}

export async function createCard(db: Database, image: string) {
  const id = uniqid()
  const event: CardCreatedEvent = {
    type: "card_created",
    payload: {
      id,
      image: '/' + image
    }
  }
  return insertEvent(db, "card", event)
}

export function card_created(cards: Card[], event: Event): Card[] {
  return [
    ...cards,
    {
      id: event.payload.id,
      name: "No name set",
      image: event.payload.image,
      emissions: -1,
      language: "none"
    }
  ]
}
