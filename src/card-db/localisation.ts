import { Database } from "sqlite3";
import { Event, events, insertEvent } from "./events";
import { Language, languages } from "./languages";
import { Controller } from "./types"

type Localisation = {
  key: string
  translation: string
  language: string
}

type LocalisationJSON = {
  [language: string]: {
    translation: {
      [key: string]: string
    }
  }
}

function keyAdded(localisations: Localisation[], languages: Language[], event: Event): Localisation[] {
  const key = event.payload.key
  const existing = localisations.filter(l => l.key === key).map(l => l.language)
  const added = languages
    .map(l => l.iso_639_2)
    .filter(l => !existing.includes(l))
    .map(language => {
      return {
        key,
        translation: key,
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

function onEvent(localisations: Localisation[], languages: Language[], event: Event): Localisation[] {
  switch (event.type) {
    case "key-added":
      return keyAdded(localisations, languages, event)
    case "key-removed":
      return keyRemoved(localisations, event)
    case "translation-set":
      return translationSet(localisations, event)
    default:
      return localisations
  }
}

function localisations(events: Event[], language: string = ""): Localisation[] {
  return events.reduce((localisations, event) => onEvent(localisations, languages(events), event), [] as Localisation[])
               .filter(l => language !== "" ? l.language === language : l)
}

function jsonTranslations(localisations: Localisation[], language: string): any {
  return localisations
    .filter(l => l.language === language)
    .reduce((translations, localisation) => {
      return {
        ...translations,
        [localisation.key]: localisation.translation
      }
    }, {})
}

function localisationsJSON(events: Event[]): LocalisationJSON {
  const locs = localisations(events)
  const languages = [...new Set(locs.map(l => l.language))]
  return languages
    .reduce((resource, language) => {
      return {
        ...resource,
        [language]: {
          translation: jsonTranslations(locs, language)
        }
      }
    }, {})
  /*
  return {
    sv: {
      translation: {
        "altLogo": "Klimatkoll logga",
        "play": "Spela",
        "go-back": "Tillbaka",
        "create-game": "Skapa spel",
        "join-game": "Gå med i spel",
        "leave-game": "Lämna spel",
        "room-id": "Spelets namn",
        "sp-instructions": "Försök spela så många kort du kan",
        "sp-game-over": "Slut på kort! Du placerade {{cards}} kort på rätt plats",
        "cards-left": "Kort kvar",
        "correct-placements": "Kort placerade på rätt plats"
      }
    },
    en: {
      translation: {
        "cards-left": "Cards left",
        "correct-placements": "Correct placements",
        "sp-game-over": "Game over! You placed {{cards}} cards correctly",
        "sp-instructions": "Try to play as many cards as you can",
      }
    }
  }
  */
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
    const es = [
      ...await events(db, "localisation"),
      ...await events(db, "language")
    ]
    res.render('localisation', {
      localisations: localisations(es, req.params.language),
      language: req.params.language,
      languages: languages(await events(db, "language"))
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

function jsonView(db: Database): Controller {
  return async (_req, res) => {
    const es = [
      ...await events(db, "localisation"),
      ...await events(db, "language")
    ]
    return res.json(localisationsJSON(es))
  }
}

export default {
  view,
  add: addKeyView,
  remove: removeKeyView,
  translate: translateView,
  json: jsonView
} as const
