import { Request, Response } from "express"
import { pairImages } from "./pair-images"

export type Controller = (req: Request, res: Response) => void

export type Route = {
  url: string
  controller: Controller
}

function route(url: string, controller: Controller): Route {
  return { url, controller }
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
    route('/pair-images', pairImages)
  ]
}
