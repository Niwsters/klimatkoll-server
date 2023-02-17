import { Card } from './card'
import { Event, insertEvent } from '../events'
import { Database } from 'sqlite3'

export type CardSetBGColorBackEvent = {
  type: "card_bg_color_back_set",
  payload: {
    id: string,
    bg_color_back: string
  }
}

export async function setCardBGColorBack(db: Database, id: string, bg_color_back: string) {
  const event: CardSetBGColorBackEvent = {
    type: "card_bg_color_back_set",
    payload: { id, bg_color_back }
  }
  return insertEvent(db, "card", event)
}

export function card_bg_color_back_set(cards: Card[], event: Event): Card[] {
  return cards.map(card => {
    if (card.id !== event.payload.id) return card

    return {
      ...card,
      bg_color_back: event.payload.bg_color_back
    }
  })
}
