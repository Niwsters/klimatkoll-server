import { Database } from 'sqlite3'
import { events, Event } from '../events'
import { Card } from './card'
import { card_created } from './create-card'
import { card_emissions_set } from './set-card-emissions'
import { card_language_set } from './set-card-language'
import { card_name_set } from './set-card-name'

type Handler = (cards: Card[], event: Event) => Card[]

const handlers: { [eventType: string]: Handler } = {
  "card_created": card_created,
  "card_name_set": card_name_set,
  "card_emissions_set": card_emissions_set,
  "card_language_set": card_language_set
}

function handler(eventType: string): Handler {
  const result = handlers[eventType]
  if (result) return result
  return (cards, _event) => cards
}

function onEvent(cards: Card[], event: Event): Card[] {
  return handler(event.type)(cards, event)
}

export async function cards(db: Database): Promise<Card[]> {
  const cardEvents = await events(db, "card")
  return cardEvents.reduce(onEvent, [])
}

export async function cardsByLanguage(
  db: Database,
  language: string
): Promise<Card[]> {
  return (await cards(db)).filter(card => card.language === language)
}

export async function card(db: Database, id: string): Promise<Card> {
  const result = (await cards(db)).find(card => card.id === id)
  if (!result) throw new Error(`Could not find card with id: ${id}`)
  return result
}
