import http from 'http'
import express from 'express'
import fileUpload from 'express-fileupload'
import path from 'path'
import { routes } from './routes'
import bodyParser from 'body-parser'
import { ensureEventsDBCreated } from './events'
import { auth } from './auth'
import { startCardImageProcessing } from './start-card-image-processing'
import { location } from './location'
import fs from 'fs'

function rewriteURL(req: any, _: any, next: any) {
  req.url = req.url.replace(/^\/admin/, "")
  next()
}

async function app() {
  const config = JSON.parse(fs.readFileSync("./card-db-config.json").toString())
  const loc = location(config.dataLocation)
  const db = ensureEventsDBCreated(loc.root)

  startCardImageProcessing(db, loc)

  const e = express()

  e.use(auth)
  e.use(fileUpload())
  e.use(rewriteURL)
  e.use(express.static(loc.pngFolder))
  e.use(express.static(loc.pairsFolder))
  e.use(express.static(loc.assetsFolder))
  e.use(bodyParser.json())

  e.set('view engine', 'pug')
  e.set('views', path.join('../card-db/views'))

  routes(db, loc).forEach(route => {
    switch (route.method) {
      case "post":
	      return e.post(route.url, route.controller)
      default:
	      return e.get(route.url, route.controller)
    }
  })

  return e
}

export async function startCardDB() {
  return new Promise(async (resolve) => {
    const port = 3001
    http
      .createServer(await app())
      .listen(3001, () => {
        console.log(`Card database listening on ${port}`)
        resolve(null)
      })
  })
}
