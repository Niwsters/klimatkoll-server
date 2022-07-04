import { Database } from 'sqlite3'
import { insertEvent, Event } from '../events'
import { Card } from './card'

type CardSetLanguageEvent = {
  type: "card_language_set",
  payload: {
    id: string,
    language: string
  }
}

export async function setCardLanguage(db: Database, id: string, language: string) {
  const event: CardSetLanguageEvent = {
    type: "card_language_set",
    payload: { id, language }
  }
  return insertEvent(db, "card", event)
}

export function card_language_set(cards: Card[], event: Event): Card[] {
  return cards.map(card => {
    if (card.id !== event.payload.id) return card

    return {
      ...card,
      language: event.payload.language
    }
  })
}
