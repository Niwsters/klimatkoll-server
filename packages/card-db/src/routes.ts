import { Database } from "sqlite3"
import card from "./card-view"
import localisation from "./localisation"
import languages from "./languages"
import removeImage from "./remove-image"
import { pairImages, pairImagesView } from "./pair-images"
import { Controller } from "./types"
import * as upload from './upload'
import { Location } from "./location"

export type Route = {
  method: string
  url: string
  controller: Controller
}

function route(url: string, controller: Controller, method: string = "get"): Route {
  const newCtrl: Controller = (req, res) => {
    controller(req, res, (view: string, data: any) => res.render(view, { path: req.path, ...data }))
  }

  return { url, controller: newCtrl, method }
}

function renderView(view: string, data: any = {}): Controller {
  return async (req, res) => res.render(view, { path: req.path, ...data })
}

export function routes(db: Database, location: Location): Route[] {
  return [
    route('/', renderView('card-db')),
    route('/upload', renderView('upload')),
    route('/upload', upload.zip(location), "post"),
    route('/languages', languages.view(db)),
    route('/languages/add', languages.add(db), "post"),
    route('/languages/remove', languages.remove(db), "post"),
    route('/json/languages', languages.json(db)),
    route('/cards', card.list(db)),
    route('/card/:id/update', card.update(db), "post"),
    route('/card/:id/remove', card.remove(db, location), "post"),
    route('/cards/json', card.listJSON(db)),
    route('/remove-images', removeImage.view(location)),
    route('/remove-images', removeImage.remove(location), "post"),
    route('/pair-images', pairImagesView(location)),
    route('/pair-images', pairImages(location), "post"),
    route('/localisation', localisation.view(db)),
    route('/localisation/:language', localisation.view(db)),
    route('/localisation/:language/add-key', localisation.add(db), "post"),
    route('/localisation/:language/remove-key', localisation.remove(db), "post"),
    route('/localisation/:language/translate', localisation.translate(db), "post"),
    route('/json/localisation', localisation.json(db)),
  ]
}
