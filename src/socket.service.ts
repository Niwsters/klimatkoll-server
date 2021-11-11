import { server as WebSocketServer, connection as WebSocketConnection } from 'websocket'
import http, { Server as HTTPServer } from 'http'
import express, { Application } from 'express'
import cors from 'cors'
import { Subject } from 'rxjs'

import auth from './auth'
import { originIsAllowed } from './origin'
import { Socket, SocketEvent, SocketResponse } from './socket'

export class SocketService {
  app: Application = express()
  httpServer: HTTPServer 
  wsServer: WebSocketServer
  sockets: Socket[] = []

  events$: Subject<SocketEvent> = new Subject()

  handleResponse(response: SocketResponse) {
    console.log("Response:", response)

    const socket = this.sockets.find((s: Socket) => s.socketID === response.socketID)
    if (!socket)
      throw new Error(`Could not find socket with ID: ${response.socketID}`)
    socket.sendEvent(
      response.event_type,
      response.payload
    )
  }

  constructor(port: number = 3000) {
    const app = this.app

    const corsSettings = {
      origin: ['http://localhost:4200'],
      methods: ['GET', 'HEAD'],
      allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept']
    }

    app.use('/*', cors(corsSettings))

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

    wsServer.on('request', (request) => {
      if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject()
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.')
        return
      }

      const protocol = request.requestedProtocols[0]

      if (!Socket.isProtocolAllowed(protocol)) {
        request.reject()
        return
      }

      const connection = request.accept(protocol, request.origin)
      const socket = new Socket(connection, protocol)
      socket.events$.subscribe((e: SocketEvent) => this.events$.next(e))
      this.sockets.push(socket)

      this.events$.next(new SocketEvent('connected', { socketID: socket.socketID }))
    })
  }
}
