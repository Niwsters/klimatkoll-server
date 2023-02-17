import { Database } from 'sqlite3'
import { insertEvent } from '../events'
import { Card } from './card'
import { Event } from '../events'

type CardSetSubtitleEvent = {
  type: "card_subtitle_set",
  payload: {
    id: string,
    subtitle: string
  }
}

export async function setCardSubtitle(db: Database, id: string, subtitle: string) {
  const event: CardSetSubtitleEvent = {
    type: "card_subtitle_set",
    payload: { id, subtitle }
  }
  return insertEvent(db, "card", event)
}

export function card_subtitle_set(cards: Card[], event: Event): Card[] {
  return cards.map(card => {
    if (card.id !== event.payload.id) return card

    return {
      ...card,
      subtitle: event.payload.subtitle
    }
  })
}
