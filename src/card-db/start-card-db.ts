import http from 'http'
import express from 'express'

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
    route('/upload-pdf', 'upload-pdf')
  ]
}

function app() {
  const e = express()
  e.set('view engine', 'pug')
  routes().forEach(route => e.get(route.url, (_req, res) => res.render(route.view)))
  return e
}

export function startCardDB() {
  const port = 3001
  http
    .createServer(app())
    .listen(3001, () => console.log(`Server listening on ${port}`))
}
