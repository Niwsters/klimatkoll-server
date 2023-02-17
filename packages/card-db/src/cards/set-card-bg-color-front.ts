import { Card } from './card'
import { Event, insertEvent } from '../events'
import { Database } from 'sqlite3'

export type CardSetBGColorFrontEvent = {
  type: "card_bg_color_front_set",
  payload: {
    id: string,
    bg_color_front: string
  }
}

export async function setCardBGColorFront(db: Database, id: string, bg_color_front: string) {
  const event: CardSetBGColorFrontEvent = {
    type: "card_bg_color_front_set",
    payload: { id, bg_color_front }
  }
  return insertEvent(db, "card", event)
}

export function card_bg_color_front_set(cards: Card[], event: Event): Card[] {
  return cards.map(card => {
    if (card.id !== event.payload.id) return card

    return {
      ...card,
      bg_color_front: event.payload.bg_color_front
    }
  })
}
