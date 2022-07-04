import { Database } from "sqlite3";
import { card, cards, setCardName, setCardEmissions, setCardLanguage } from "./cards";
import { Controller } from "./types";

export function cardListView(db: Database): Controller {
  return async (_req, res) => res.render("cards", { cards: await cards(db) })
}

export function cardDetailView(db: Database): Controller {
  return async (req, res) => {
    res.render("card", { card: await card(db, req.params.name) })
  }
}

export function setEmissionsView(db: Database): Controller {
  return async (_req, res) => {
    res.render("set-emissions", { cards: await cards(db) })
  }
}

export function cardSetName(db: Database): Controller {
  return async (req, res) => {
    setCardName(db, req.body.id, req.body.name)
    res.redirect("/cards")
  }
}

export function cardSetEmissions(db: Database): Controller {
  return async (req, res) => {
    setCardEmissions(db, req.body.id, req.body.emissions)
    res.redirect("/cards")
  }
}

export function cardSetLanguage(db: Database): Controller {
  return async (req, res) => {
    setCardLanguage(db, req.body.id, req.body.language)
    res.redirect("/cards")
  }
}
