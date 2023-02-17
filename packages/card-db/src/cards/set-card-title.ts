import { Database } from 'sqlite3'
import { insertEvent } from '../events'
import { Card } from './card'
import { Event } from '../events'

type CardSetTitleEvent = {
  type: "card_title_set",
  payload: {
    id: string,
    title: string
  }
}

export async function setCardTitle(db: Database, id: string, title: string) {
  const event: CardSetTitleEvent = {
    type: "card_title_set",
    payload: { id, title }
  }
  return insertEvent(db, "card", event)
}

export function card_title_set(cards: Card[], event: Event): Card[] {
  return cards.map(card => {
    if (card.id !== event.payload.id) return card

    return {
      ...card,
      title: event.payload.title
    }
  })
}
