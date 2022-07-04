import { Database } from "sqlite3";
import { card, cards } from "./cards";
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
