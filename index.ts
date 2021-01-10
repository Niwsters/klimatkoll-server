import { server as WebSocketServer, connection as WebSocketConnection } from 'websocket'
import http from 'http'
import seedrandom from 'seedrandom'
import cards from './src/cards'
import { getClientEvents, createEvent, Event } from './src/event'

class Socket {
  static nextSocketID: number = 0

  socketID: number
  connection: WebSocketConnection

  constructor(connection: WebSocketConnection) {
    this.connection = connection
    this.socketID = Socket.nextSocketID++
  }
}

const server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url)
    response.writeHead(404)
    response.end()
})

server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080')
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
  // put logic here to detect whether the specified origin is allowed.
  return true
}

let sockets: Socket[] = []
const events: Event[] = []
function addEvent(eventType: string, payload: any) {
  events.push(createEvent(eventType, payload))

  console.log(events)

  sockets.forEach((socket: Socket) => {
    socket.connection.send(JSON.stringify(getClientEvents(events, socket.socketID.toString())))
  })
}

wsServer.on('request', function(request) {
  if (!originIsAllowed(request.origin)) {
    // Make sure we only accept requests from an allowed origin
    request.reject()
    console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.')
    return
  }
  
  const connection = request.accept('echo-protocol', request.origin)
  const socket = new Socket(connection)
  sockets.push(socket)
  console.log((new Date()) + ' Player connected')
  addEvent('player_connected', { socketID: socket.socketID })

  connection.on('close', function(reasonCode, description) {
    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.')
    addEvent('player_disconnected', { socketID: socket.socketID })
  })
})
