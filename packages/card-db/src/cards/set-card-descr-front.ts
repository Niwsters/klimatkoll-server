import { Database } from 'sqlite3'
import { insertEvent } from '../events'
import { Card } from './card'
import { Event } from '../events'

type CardSetDescrFrontEvent = {
  type: "card_descr_front_set",
  payload: {
    id: string,
    descr_front: string
  }
}

export async function setCardDescrFront(db: Database, id: string, descr_front: string) {
  const event: CardSetDescrFrontEvent = {
    type: "card_descr_front_set",
    payload: { id, descr_front }
  }
  return insertEvent(db, "card", event)
}

export function card_descr_front_set(cards: Card[], event: Event): Card[] {
  return cards.map(card => {
    if (card.id !== event.payload.id) return card

    return {
      ...card,
      descr_front: event.payload.descr_front
    }
  })
}
