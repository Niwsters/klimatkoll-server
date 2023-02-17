import { Database } from 'sqlite3'
import { insertEvent } from '../events'
import { Card } from './card'
import { Event } from '../events'

type CardSetDescrBackEvent = {
  type: "card_descr_back_set",
  payload: {
    id: string,
    descr_back: string
  }
}

export async function setCardDescrBack(db: Database, id: string, descr_back: string) {
  const event: CardSetDescrBackEvent = {
    type: "card_descr_back_set",
    payload: { id, descr_back }
  }
  return insertEvent(db, "card", event)
}

export function card_descr_back_set(cards: Card[], event: Event): Card[] {
  return cards.map(card => {
    if (card.id !== event.payload.id) return card

    return {
      ...card,
      descr_back: event.payload.descr_back
    }
  })
}
