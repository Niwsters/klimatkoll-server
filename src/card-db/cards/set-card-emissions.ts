import { Database } from 'sqlite3'
import { insertEvent } from '../events'
import { Card } from './card'
import { Event } from '../events'

type CardSetEmissionsEvent = {
  type: "card_emissions_set",
  payload: {
    id: string,
    emissions: number
  }
}

export async function setCardEmissions(db: Database, id: string, emissions: string) {
  const event: CardSetEmissionsEvent = {
    type: "card_emissions_set",
    payload: { id, emissions: parseInt(emissions) }
  }
  return insertEvent(db, "card", event)
}

export function card_emissions_set(cards: Card[], event: Event): Card[] {
  return cards.map(card => {
    if (card.id !== event.payload.id) return card

    return {
      ...card,
      emissions: event.payload.emissions
    }
  })
}
