import { server as WebSocketServer, connection as WebSocketConnection } from 'websocket'
import http, { Server as HTTPServer } from 'http'
import express, { Application, Request } from 'express'
import path from 'path'
import fs from 'fs'

import { originIsAllowed } from './origin'

interface Data {
  type: string
  payload: any
}

export class HTMLServer {
  app: Application = express()
  httpServer: HTTPServer 

  constructor(port: number = 4200) {
    const app = this.app

    app.use(express.static(__dirname + '/../public'))

    app.get('/sv', (req, res) => {
      res.sendFile(__dirname + '/public/sv/index.html')
    })
    app.get('/en', (req, res) => {
      res.sendFile(__dirname + '/public/en/index.html')
    })

    this.httpServer = http.createServer(app)
    const httpServer = this.httpServer

    httpServer.listen(port, function() {
      console.log((new Date()) + ` Server is listening on port ${port}`)
    })
  }
}
