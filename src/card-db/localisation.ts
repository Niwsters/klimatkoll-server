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

function onEvent(localisations: Localisation[], event: Event): Localisation[] {
  if (event.type === "key-added")
    return keyAdded(localisations, event)

  return localisations
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

async function addKey(db: Database, key: string) {
  await insertEvent(db, "localisation", keyAddedEvent(key))
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

export default {
  view,
  add: addKeyView
} as const
