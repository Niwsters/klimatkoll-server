import { Database } from 'sqlite3'
import { events, Event } from '../events'
import { Card } from './card'
import { card_created } from './create-card'
import { card_emissions_set } from './set-card-emissions'
import { card_language_set } from './set-card-language'
import { card_name_set } from './set-card-name'
import { card_removed } from './remove-card'
import { card_title_set } from './set-card-title'
import { card_subtitle_set } from './set-card-subtitle'
import { card_descr_front_set } from './set-card-descr-front'
import { card_descr_back_set } from './set-card-descr-back'
import { card_duration_set } from './set-card-duration'
import { card_bg_color_front_set } from './set-card-bg-color-front'
import { card_bg_color_back_set } from './set-card-bg-color-back'
import { Language, languages } from '../languages'

type Handler = (cards: Card[], event: Event) => Card[]

type EnrichedCard = Card & { languageLabel: string }

const handlers: { [eventType: string]: Handler } = {
  "card_created": card_created,
  "card_removed": card_removed,
  "card_name_set": card_name_set,
  "card_emissions_set": card_emissions_set,
  "card_language_set": card_language_set,

  "card_title_set": card_title_set,
  "card_subtitle_set": card_subtitle_set,
  "card_descr_front_set": card_descr_front_set,
  "card_descr_back_set": card_descr_back_set,
  "card_duration_set": card_duration_set,
  
  "card_bg_color_front_set": card_bg_color_front_set,
  "card_bg_color_back_set": card_bg_color_back_set
}

function handler(eventType: string): Handler {
  const result = handlers[eventType]
  if (result) return result
  return (cards, _event) => cards
}

function onEvent(cards: Card[], event: Event): Card[] {
  return handler(event.type)(cards, event)
}

function addLanguageLabels(cards: Card[], languages: Language[]): EnrichedCard[] {
  return cards.map(card => {
    return {
      ...card,
      languageLabel: languages.find(c => c.iso_639_2 === card.language)?.label || 'Unknown language'
    }
  })
}

function filterCards(cards: EnrichedCard[], search: string): EnrichedCard[] {
  if (search !== '') {
    cards = cards.filter(c => c.languageLabel.toUpperCase() === search.toUpperCase() ||
                              c.name.toUpperCase().includes(search.toUpperCase()))
  }
  return cards
}

export async function cards(db: Database, search: string = ""): Promise<Card[]> {
  const langs = languages(await events(db, "language"))
  const cardEvents = await events(db, "card")
  let cards = cardEvents.reduce(onEvent, [])
  let enrichedCards = addLanguageLabels(cards, langs)
  enrichedCards = filterCards(enrichedCards, search)
  return enrichedCards
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
