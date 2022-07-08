import { Database } from "sqlite3"
import {
  cardDetailView,
  cardListView,
  setEmissionsView,
  cardSetName,
  cardSetEmissions,
  cardSetLanguage,
  cardListJSON
} from "./card-view"
import localisation from "./localisation"
import { pairImages, pairImagesView } from "./pair-images"
import { Controller } from "./types"
import { uploadPDF } from "./upload-pdf"

export type Route = {
  method: string
  url: string
  controller: Controller
}

function route(url: string, controller: Controller, method: string = "get"): Route {
  return { url, controller, method }
}

function renderView(view: string): Controller {
  return async (_req, res) => res.render(view)
}

export function routes(db: Database): Route[] {
  return [
    route('/', renderView('card-db')),
    route('/upload', renderView('upload')),
    route('/languages', renderView('languages')),
    route('/cards', cardListView(db)),
    route('/card/:name', cardDetailView(db)),
    route('/card/:id/set-name', cardSetName(db), "post"),
    route('/card/:id/set-emissions', cardSetEmissions(db), "post"),
    route('/card/:id/set-language', cardSetLanguage(db), "post"),
    route('/set-emissions', setEmissionsView(db)),
    route('/pair-images', pairImagesView),
    route('/pair-images', pairImages, "post"),
    route('/upload', uploadPDF, "post"),
    route('/cards/json', cardListJSON(db)),
    route('/localisation', localisation.view(db)),
    route('/localisation/:language', localisation.view(db)),
    route('/localisation/:language/add-key', localisation.add(db), "post"),
    route('/localisation/:language/remove-key', localisation.remove(db), "post"),
    route('/localisation/:language/translate', localisation.translate(db), "post"),
    route('/json/localisation', localisation.json(db))
  ]
}
