import { server as WebSocketServer, connection as WebSocketConnection } from 'websocket'
import http, { Server as HTTPServer } from 'http'
import express, { Application } from 'express'
import cors from 'cors'
import path from 'path'

import auth from './auth'
import cardsSV from './cards-sv'
import cardsEN from './cards-en'
import { Socket } from './socket'
import { RoomController } from './room'
import { originIsAllowed } from './origin'

interface Data {
  type: string
  payload: any
}

export class CDNServer {
  app: Application = express()
  httpServer: HTTPServer 
  wsServer: WebSocketServer
  roomCtrlSV: RoomController
  roomCtrlEN: RoomController

  constructor(port: number = 4200) {
    const app = this.app

    app.use('/fonts/*', cors({
      origin: ['http://localhost:3000'],
      methods: ['GET', 'HEAD'],
      allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept']
    }))

    app.use(express.static(__dirname + '/../public'))

    this.httpServer = http.createServer(app)
    const httpServer = this.httpServer

    httpServer.listen(port, function() {
      console.log((new Date()) + ` Server is listening on port ${port}`)
    })

    this.wsServer = new WebSocketServer({
      httpServer: httpServer,
      // You should not use autoAcceptConnections for production
      // applications, as it defeats all standard cross-origin protection
      // facilities built into the protocol and the browser.  You should
      // *always* verify the connection's origin and decide whether or not
      // to accept it.
      autoAcceptConnections: false
    })
    const wsServer = this.wsServer

    this.roomCtrlSV = new RoomController(cardsSV)
    this.roomCtrlEN = new RoomController(cardsEN)

    wsServer.on('request', (request) => {
      if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject()
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.')
        return
      }

      const protocol = request.requestedProtocols[0]

      switch (protocol) {
        case "sv": {
          console.log("SV!")
          const connection = request.accept('sv', request.origin)
          const socket = new Socket(connection)
          this.roomCtrlSV.addSocket(socket)
          break
        }
        case "en": {
          console.log("EN!")
          const connection = request.accept('en', request.origin)
          const socket = new Socket(connection)
          this.roomCtrlEN.addSocket(socket)
          break
        }
        default: {
          request.reject()
          return
        }
      }
    })
  }
}
