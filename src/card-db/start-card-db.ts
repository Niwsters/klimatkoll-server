import http from 'http'
import express, { Request, Response } from 'express'
import fileUpload, { UploadedFile } from 'express-fileupload'
import { fromBuffer } from 'pdf2pic'

type Route = {
  url: string
  view: string
}

function route(url: string, view: string): Route {
  return { url, view }
}

function routes () {
  return [
    route('/', 'card-db'),
    route('/upload', 'upload'),
    route('/languages', 'languages'),
    route('/cards', 'cards')
  ]
}

function upload(req: Request, res: Response) {
  const cards = req.files?.cards as UploadedFile
  if (!cards)
    return res.status(400).send("No cards were uploaded")

  console.log(convert(cards.data))
  res.send("oh hi")
}

function convert(pdf: Buffer) {
  (fromBuffer(pdf, {
    density: 200,
    format: "png",
    savePath: "./images",
    width: 437,
    height: 648
  }) as any).bulk(-1)
}

function app() {
  const e = express()

  e.use(fileUpload())

  e.set('view engine', 'pug')
  routes().forEach(route => e.get(route.url, (_req, res) => res.render(route.view)))

  e.post('/upload', upload)
  return e
}

export function startCardDB() {
  const port = 3001
  http
    .createServer(app())
    .listen(3001, () => console.log(`Server listening on ${port}`))
}
