import http from 'http'
import express from 'express'
import fileUpload from 'express-fileupload'
import path from 'path'
import { routes } from './routes'
import { ensureEventsDBCreated } from './events'
import { auth } from './auth'
import { location } from './location'
import fs from 'fs'

function url(url: string): string {
  url = url.replace(/^\/admin/, "")
  if (url === "") url = "/"
  return url
}

function rewriteURL(req: any, _: any, next: any) {
  req.url = url(req.url)
  next()
}

async function app() {
  const config = JSON.parse(fs.readFileSync("./card-db-config.json").toString())
  const loc = location(config.dataLocation)
  const db = ensureEventsDBCreated(loc.root)

  const e = express()

  e.use(auth)
  e.use(fileUpload())
  e.use(rewriteURL)
  e.use(express.static(loc.assetsFolder))
  e.use(express.json())

  e.set('view engine', 'pug')
  e.set('views', path.join('../card-db/views'))

  e.get('/client.js', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../../client.js'))
  })

  routes(db).forEach(route => {
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
    const port = 4201
    http
      .createServer(await app())
      .listen(port, () => {
        console.log(`Card database listening on ${port}`)
        resolve(null)
      })
  })
}
