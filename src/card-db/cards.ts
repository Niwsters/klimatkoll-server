import fs from 'fs'
import { Database } from 'sqlite3'
import { sleep } from './sleep'
import { events, Event, insertEvent } from './events'
import uniqid from 'uniqid'

type Card = {
  id: string,
  name: string,
  image: string,
  emissions: number,
  language: string
}

type CardCreatedEvent = {
  type: "card_created",
  payload: {
    id: string,
    image: string
  }
}

type CardSetNameEvent = {
  type: "card_name_set",
  payload: {
    id: string,
    name: string
  }
}

type CardSetEmissionsEvent = {
  type: "card_emissions_set",
  payload: {
    id: string,
    emissions: number
  }
}

type CardSetLanguageEvent = {
  type: "card_language_set",
  payload: {
    id: string,
    language: string
  }
}

function card_created(cards: Card[], event: Event): Card[] {
  return [
    ...cards,
    {
      id: event.payload.id,
      name: "No name set",
      image: event.payload.image,
      emissions: -1,
      language: "none"
    }
  ]
}

function card_name_set(cards: Card[], event: Event): Card[] {
  return cards.map(card => {
    if (card.id !== event.payload.id) return card

    return {
      ...card,
      name: event.payload.name
    }
  })
}

function card_emissions_set(cards: Card[], event: Event): Card[] {
  return cards.map(card => {
    if (card.id !== event.payload.id) return card

    return {
      ...card,
      emissions: event.payload.emissions
    }
  })
}

function card_language_set(cards: Card[], event: Event): Card[] {
  return cards.map(card => {
    if (card.id !== event.payload.id) return card

    return {
      ...card,
      language: event.payload.language
    }
  })
}

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

export async function card(db: Database, id: string): Promise<Card> {
  const result = (await cards(db)).find(card => card.id === id)
  if (!result) throw new Error(`Could not find card with id: ${id}`)
  return result
}

export async function createCard(db: Database, image: string): Promise<Card> {
  const id = uniqid()
  const event: CardCreatedEvent = {
    type: "card_created",
    payload: {
      id,
      image: '/' + image
    }
  }
  await insertEvent(db, "card", event)
  return card(db, id)
}

export async function setCardName(db: Database, id: string, name: string) {
  const event: CardSetNameEvent = {
    type: "card_name_set",
    payload: { id, name }
  }
  return insertEvent(db, "card", event)
}

export async function setCardEmissions(db: Database, id: string, emissions: string) {
  const event: CardSetEmissionsEvent = {
    type: "card_emissions_set",
    payload: { id, emissions: parseInt(emissions) }
  }
  return insertEvent(db, "card", event)
}

export async function setCardLanguage(db: Database, id: string, language: string) {
  const event: CardSetLanguageEvent = {
    type: "card_language_set",
    payload: { id, language }
  }
  insertEvent(db, "card", event)
}

// Loops through existing image pairs and adds cards into database if missing
async function processImagePairs(db: Database) {
  const existing = (await cards(db)).map(card => card.image.replace(/^\//, ''))
  const pairs = fs.readdirSync("./pairs")
  pairs
    .filter(pair => !existing.includes(pair))
    .forEach(async (pair) => await createCard(db, pair))
}

export async function startProcessingImagePairs(db: Database) {
  while (true) {
    await processImagePairs(db)
    await sleep(1000)
  }
}
