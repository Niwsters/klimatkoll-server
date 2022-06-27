import http from 'http'
import express, { Request, Response } from 'express'
import fileUpload, { UploadedFile } from 'express-fileupload'
import uniqid from 'uniqid'
import fs from 'fs'
import { startProcessingPDFFiles } from './process-pdf-files'

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

async function upload(req: Request, res: Response) {
  const cards = req.files?.cards as UploadedFile
  if (!cards)
    return res.status(400).send("No cards were uploaded")

  cards.mv(`./pdf/${uniqid()}.pdf`)

  res.send("oh hi")
}

function createPDFDir() {
  if (!fs.existsSync('./pdf'))
    fs.mkdirSync('./pdf')
}

function app() {
  createPDFDir()
  startProcessingPDFFiles()

  const e = express()

  e.use(fileUpload())

  e.set('view engine', 'pug')
  routes().forEach(route => e.get(route.url, async (_req, res) => res.render(route.view)))

  e.post('/upload', upload)
  return e
}

export function startCardDB() {
  const port = 3001
  http
    .createServer(app())
    .listen(3001, () => console.log(`Server listening on ${port}`))
}
