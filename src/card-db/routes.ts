import { Request, Response } from "express"
import { pairImages } from "./pair-images"
import { uploadPDF } from "./upload-pdf"

export type Controller = (req: Request, res: Response) => void

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

export function routes(): Route[] {
  return [
    route('/', renderView('card-db')),
    route('/upload', renderView('upload')),
    route('/languages', renderView('languages')),
    route('/cards', renderView('cards')),
    route('/pair-images', pairImages),
    route('/upload', uploadPDF, "post")
  ]
}
