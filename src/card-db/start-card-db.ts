import http from 'http'
import express from 'express'

function app() {
  const e = express()
  e.set('view engine', 'pug')
  e.get('/', (_req, res) => {
    res.render('card-db')
  })
  e.get('/upload-pdf', (_req, res) => {
    res.render('upload-pdf')
  })
  return e
}

export function startCardDB() {
  const port = 3001
  http
    .createServer(app())
    .listen(3001, () => console.log(`Server listening on ${port}`))
}
