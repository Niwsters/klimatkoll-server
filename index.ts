import { server as WebSocketServer, connection as WebSocketConnection } from 'websocket'
import http from 'http'
import seedrandom from 'seedrandom'
import cards from './src/cards'
import { GameEvent, EventHandler } from './src/event'

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

interface Data {
  type: string
  payload: any
}

let sockets: Socket[] = []
let events: GameEvent[] = []
function addEvent(eventType: string, payload: any) {
  events.push(EventHandler.createServerEvent(eventType, payload))

  const state = EventHandler.getServerState(events)

  console.log(state.clientEvents)

  const data = {
    type: "events",
    payload: state.clientEvents
  }

  sockets.forEach((socket: Socket) => {
    socket.connection.send(JSON.stringify(data))
  })
}

const decoder = new TextDecoder('utf8')
wsServer.on('request', function(request) {
  if (!originIsAllowed(request.origin)) {
    // Make sure we only accept requests from an allowed origin
    request.reject()
    console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.')
    return
  }

  if (sockets.length >= 2) {
    request.reject()
    console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected: Room full')
    return
  }
  
  const connection = request.accept('echo-protocol', request.origin)
  const socket = new Socket(connection)
  sockets.push(socket)
  console.log((new Date()) + ' Player connected')
  socket.connection.send(JSON.stringify({ type: "socketID", payload: socket.socketID }))
  addEvent('player_connected', { socketID: socket.socketID })

  connection.on('message', (msg: any) => {
    if (msg.type == 'binary') {
      const event = JSON.parse(msg.binaryData)
      addEvent(event.type, { socketID: socket.socketID, ...event.payload })
      console.log(events)
    }
  })

  connection.on('close', function(reasonCode, description) {
    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.')
    addEvent('player_disconnected', { socketID: socket.socketID })
    // Reset game after player disconnected
    events = []
  })
})
