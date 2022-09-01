import { Database } from "sqlite3";
import {
  cards,
  setCardName,
  setCardEmissions,
  setCardLanguage,
  removeCard,
  card
} from "./cards";
import { events } from "./events";
import { languages } from "./languages";
import { Controller } from "./types";
import { removeImagePair } from "./pair-images";
import { Location } from "./location";

function listView(db: Database): Controller {
  return async (_req, res) => res.render("cards", { cards: await cards(db), languages: languages(await events(db, "language")) })
}

function listJSONView(db: Database): Controller {
  return async (_req, res) => {
    res.json(await cards(db))
  }
}

function removeView(db: Database, location: Location): Controller {
  return async (req, res) => {
    await removeImagePair((await card(db, req.body.id)).image, location)
    await removeCard(db, req.body.id)
    return listView(db)(req, res)
  }
}

function updateView(db: Database): Controller {
  return async (req, res) => {
    setCardName(db, req.body.id, req.body.name)
    setCardEmissions(db, req.body.id, req.body.emissions)
    setCardLanguage(db, req.body.id, req.body.language)
    return res.redirect('/admin/cards')
  }
}

export default {
  list: listView,
  listJSON: listJSONView,
  remove: removeView,
  update: updateView
}
