import { Database } from "sqlite3"
import { cardDetailView, cardListView } from "./card-view"
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
    route('/pair-images', pairImagesView),
    route('/pair-images', pairImages, "post"),
    route('/upload', uploadPDF, "post")
  ]
}
