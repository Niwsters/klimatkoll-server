import { Card } from './card'
import { Event, insertEvent } from '../events'
import { Database } from 'sqlite3'

export type CardSetNameEvent = {
  type: "card_name_set",
  payload: {
    id: string,
    name: string
  }
}

export async function setCardName(db: Database, id: string, name: string) {
  const event: CardSetNameEvent = {
    type: "card_name_set",
    payload: { id, name }
  }
  return insertEvent(db, "card", event)
}

export function card_name_set(cards: Card[], event: Event): Card[] {
  return cards.map(card => {
    if (card.id !== event.payload.id) return card

    return {
      ...card,
      name: event.payload.name
    }
  })
}
