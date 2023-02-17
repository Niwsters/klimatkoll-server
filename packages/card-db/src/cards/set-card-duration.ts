import { Card } from './card'
import { Event, insertEvent } from '../events'
import { Database } from 'sqlite3'

export type CardSetDurationEvent = {
  type: "card_duration_set",
  payload: {
    id: string,
    duration: string
  }
}

export async function setCardDuration(db: Database, id: string, duration: string) {
  const event: CardSetDurationEvent = {
    type: "card_duration_set",
    payload: { id, duration }
  }
  return insertEvent(db, "card", event)
}

export function card_duration_set(cards: Card[], event: Event): Card[] {
  return cards.map(card => {
    if (card.id !== event.payload.id) return card

    return {
      ...card,
      duration: event.payload.duration
    }
  })
}
