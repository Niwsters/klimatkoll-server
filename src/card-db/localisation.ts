import { Database } from "sqlite3";
import { Event, events, insertEvent } from "./events";
import { Controller } from "./types"

type Localisation = {
  key: string
  translation: string
  language: string
}

const languages = ["sv", "en"]

function keyAdded(localisations: Localisation[], event: Event): Localisation[] {
  const key = event.payload.key
  const existing = localisations.filter(l => l.key === key).map(l => l.language)
  const added = languages
    .filter(l => !existing.includes(l))
    .map(language => {
      return {
        key,
        translation: "",
        language
      }
    })
  return [...localisations, ...added]
}

function keyRemoved(localisations: Localisation[], event: Event): Localisation[] {
  const key = event.payload.key
  return localisations.filter(l => l.key !== key)
}

function translationSet(localisations: Localisation[], event: Event): Localisation[] {
  const { key, translation, language } = event.payload
  return localisations.map(l => {
    if (l.key === key && l.language === language)
      return { ...l, translation: translation }

    return l
  })
}

function onEvent(localisations: Localisation[], event: Event): Localisation[] {
  switch (event.type) {
    case "key-added":
      return keyAdded(localisations, event)
    case "key-removed":
      return keyRemoved(localisations, event)
    case "translation-set":
      return translationSet(localisations, event)
    default:
      return localisations
  }
}

function localisations(events: Event[], language: string): Localisation[] {
  return events.reduce(onEvent, [])
               .filter(l => l.language === language)
}

function keyAddedEvent(key: string): Event {
  return {
    type: "key-added",
    payload: { key }
  }
}

function keyRemovedEvent(key: string): Event {
  return {
    type: "key-removed",
    payload: { key }
  }
}

function translationSetEvent(key: string, translation: string, language: string): Event {
  return {
    type: "translation-set",
    payload: { key, translation, language }
  }
}

async function addKey(db: Database, key: string) {
  await insertEvent(db, "localisation", keyAddedEvent(key))
}

async function removeKey(db: Database, key: string) {
  await insertEvent(db, "localisation", keyRemovedEvent(key))
}

async function translate(db: Database, key: string, translation: string, language: string) {
  await insertEvent(db, "localisation", translationSetEvent(key, translation, language))
}

function view(db: Database): Controller {
  return async (req, res) => {
    res.render('localisation', {
      localisations: localisations(await events(db, "localisation"), req.params.language),
      language: req.params.language
    })
  }
}

function addKeyView(db: Database): Controller {
  return async (req, res) => {
    await addKey(db, req.body.key)
    return view(db)(req, res)
  }
}

function removeKeyView(db: Database): Controller {
  return async (req, res) => {
    await removeKey(db, req.body.key)
    return view(db)(req, res)
  }
}

function translateView(db: Database): Controller {
  return async (req, res) => {
    await translate(db, req.body.key, req.body.translation, req.body.language)
    return view(db)(req, res)
  }
}

export default {
  view,
  add: addKeyView,
  remove: removeKeyView,
  translate: translateView
} as const
