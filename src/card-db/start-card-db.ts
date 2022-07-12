import http from 'http'
import express from 'express'
import fileUpload from 'express-fileupload'
import { routes } from './routes'
import { spawn } from 'child_process'
import bodyParser from 'body-parser'
import { ensureEventsDBCreated } from './events'
import { auth } from './auth'
import { startCardImageProcessing } from './start-card-image-processing'
import { location } from './location'

async function isProgramInstalled(program: string): Promise<boolean> {
  return new Promise(resolve => {
    const process = spawn(program, ['--version'], { shell: true })
    process.stdout.on('data', () => resolve(true))
    process.stderr.on('data', () => resolve(false))
  })
}

async function checkRequirements() {
  for (const program of ['pdf2svg']) {
    if (!await isProgramInstalled(program))
      throw new Error(`${program} not installed`)
  }
}

async function app() {
  await checkRequirements()

  const loc = location("../klimatkoll-server-data")
  const db = ensureEventsDBCreated(loc.root)

  startCardImageProcessing(db)

  const e = express()

  e.use(auth)
  e.use(fileUpload())
  e.use(express.static('png'))
  e.use(express.static('pairs'))
  e.use(bodyParser.json())

  e.set('view engine', 'pug')
  routes(db, loc).forEach(route => {
    switch (route.method) {
      case "post":
        e.post(route.url, route.controller)
      default:
        e.get(route.url, route.controller)
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
