import { server as WebSocketServer, connection as WebSocketConnection } from 'websocket'
import http from 'http'
import seedrandom from 'seedrandom'
import express from 'express'
import path from 'path'

import auth from './auth'
import cards from './src/cards'
import { Socket } from './src/socket'
import { RoomController } from './src/room'

const app = express()
// Temporarily turning off auth for an event
// app.use(auth)
app.use(express.static(__dirname + '/public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/klimatkoll.html')
})
const server = http.createServer(app)
const port = process.env.PORT || 4200
server.listen(port, function() {
  console.log((new Date()) + ` Server is listening on port ${port}`)
})


const wsServer = new WebSocketServer({
  httpServer: server,
  // You should not use autoAcceptConnections for production
  // applications, as it defeats all standard cross-origin protection
  // facilities built into the protocol and the browser.  You should
  // *always* verify the connection's origin and decide whether or not
  // to accept it.
  autoAcceptConnections: false
})

function originIsAllowed(origin: string) {
  console.log(origin)
  if (
    origin === 'http://213.164.204.255' || 
    origin === 'http://localhost:4200' ||
    origin === 'http://localhost:3000'
  ) {
    return true
  }

  return false
}

interface Data {
  type: string
  payload: any
}

const roomCtrl = new RoomController()

wsServer.on('request', function(request) {
  if (!originIsAllowed(request.origin)) {
    // Make sure we only accept requests from an allowed origin
    request.reject()
    console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.')
    return
  }
  
  const connection = request.accept('echo-protocol', request.origin)
  const socket = new Socket(connection)
  roomCtrl.addSocket(socket)
})
