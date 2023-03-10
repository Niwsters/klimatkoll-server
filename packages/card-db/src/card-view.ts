import { Database } from "sqlite3";
import {
  cards,
  setCardName,
  setCardEmissions,
  setCardLanguage,
  removeCard
} from "./cards";
import { events } from "./events";
import { languages } from "./languages";
import { Controller } from "./types";
import { setCardTitle } from "./cards/set-card-title";
import { setCardSubtitle } from "./cards/set-card-subtitle";
import { setCardDescrFront } from "./cards/set-card-descr-front";
import { setCardDescrBack } from "./cards/set-card-descr-back";
import { setCardDuration } from "./cards/set-card-duration";
import { setCardBGColorFront } from "./cards/set-card-bg-color-front";
import { setCardBGColorBack } from "./cards/set-card-bg-color-back";

function listView(db: Database): Controller {
  return async (req, _res, renderView) => {
    const search = req.query.search as string
    renderView("cards", {
      cards: await cards(db, search),
      languages: languages(await events(db, "language")),
      search: search
    })
  }
}

function listJSONView(db: Database): Controller {
  return async (_req, res) => {
    res.json(await cards(db))
  }
}

function removeView(db: Database): Controller {
  return async (req, res, renderView) => {
    await removeCard(db, req.body.id)
    return listView(db)(req, res, renderView)
  }
}

function updateView(db: Database): Controller {
  return async (req, res) => {
    const {
      id,
      name,
      emissions,
      language,
      title,
      subtitle,
      descr_front,
      descr_back,
      duration,
      bg_color_front,
      bg_color_back
    } = req.body
    setCardName(db, id, name)
    setCardEmissions(db, id, emissions)
    setCardLanguage(db, id, language)
    setCardTitle(db, id, title)
    setCardSubtitle(db, id, subtitle)
    setCardDescrFront(db, id, descr_front)
    setCardDescrBack(db, id, descr_back)
    setCardDuration(db, id, duration)
    setCardBGColorFront(db, id, bg_color_front)
    setCardBGColorBack(db, id, bg_color_back)
    const { search } = req.query
    const query = search !== undefined ? `?search=${search}` : ''
    return res.redirect(`/admin/cards${query}`)
  }
}

export default {
  list: listView,
  listJSON: listJSONView,
  remove: removeView,
  update: updateView
}
