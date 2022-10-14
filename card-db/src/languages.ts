import { Database } from "sqlite3";
import { Event, events, insertEvent } from "./events";
import { Controller } from "./types";

export type Language = {
  iso_639_2: string,
  label: string
}

type Languages = {
  [iso_639_2: string]: string
}

function toDict(languages: Language[]): Languages {
  return languages.reduce((dict, language) => {
    return {
      ...dict,
      [language.iso_639_2]: language.label
    }
  }, {})
}

function toList(dict: Languages): Language[] {
  return Object
    .keys(dict)
    .reduce((languages, iso_639_2) => {
      return [
        ...languages,
        {
          iso_639_2,
          label: dict[iso_639_2]
        }
      ]
    }, [] as Language[])
}

function toSet(languages: Language[]): Language[] {
  return toList(toDict(languages))
}

function languageAdded(languages: Language[], event: Event): Language[] {
  return toSet([
    ...languages,
    {
      iso_639_2: event.payload.iso_639_2,
      label: event.payload.label
    }
  ])
}

function languageRemoved(languages: Language[], event: Event): Language[] {
  return languages.filter(l => l.iso_639_2 !== event.payload.iso_639_2)
}

function onEvent(languages: Language[], event: Event): Language[] {
  switch (event.type) {
    case "language-added":
      return languageAdded(languages, event)
    case "language-removed":
      return languageRemoved(languages, event)
    default:
      return languages
  }
}

function addLanguageEvent(iso_639_2: string, label: string): Event {
  return {
    type: "language-added",
    payload: { iso_639_2, label }
  }
}

function removeLanguageEvent(iso_639_2: string): Event {
  return {
    type: "language-removed",
    payload: { iso_639_2 }
  }
}

export function languages(events: Event[]): Language[] {
  return events.reduce(onEvent, [])
}

async function addLanguage(db: Database, iso_639_2: string, label: string) {
  insertEvent(db, "language", addLanguageEvent(iso_639_2, label))
}

async function removeLanguage(db: Database, iso_639_2: string) {
  insertEvent(db, "language", removeLanguageEvent(iso_639_2))
}

function view(db: Database): Controller {
  return async (_req, _res, renderView) => {
    return renderView("languages", { languages: languages(await events(db, "language")) })
  }
}

function addLanguageView(db: Database): Controller {
  return async (req, res, renderView) => {
    await addLanguage(db, req.body.iso_639_2, req.body.label)
    return view(db)(req, res, renderView)
  }
}

function removeLanguageView(db: Database): Controller {
  return async (req, res, renderView) => {
    await removeLanguage(db, req.body.iso_639_2)
    return view(db)(req, res, renderView)
  }
}

function jsonView(db: Database): Controller {
  return async (_req, res) => {
    return res.json(languages(await events(db, "language")))
  }
}

export default {
  add: addLanguageView,
  remove: removeLanguageView,
  json: jsonView,
  view
}
