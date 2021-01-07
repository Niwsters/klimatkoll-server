const WebSocketServer = require('websocket').server
const http = require('http')
const seedrandom = require('seedrandom')
const cards = require('./cards')
 
const server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url)
    response.writeHead(404)
    response.end()
})

server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080')
})

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
})


function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true
}

let last_event_id = 0
function createEvent(events, type, payload={}) {
  return [
    ...events,
    {
      "event_id": last_event_id++,
      "event_type": type,
      "payload": payload
    }
  ]
}

function getClientEvents(events, socketID) {
  let deck = cards
  const players = new Map()

  return events.reduce((clientEvents, event) => {
    const type = event.event_type

    if (type == "player_connected") {
      // Assign player and draw hand
      const card = deck.pop()
      players.set(event.payload.socketID, { hand: [card] })

      if (event.payload.socketID == socketID) {
        return createEvent(clientEvents, "draw_card", { card: card })
      }

      return createEvent(clientEvents, "draw_opponent_card", { card: card })
    } else if (type == "player_disconnected") {
      const player = players.get(event.payload.socketID)

      // Return hand to deck
      deck = [
        ...player.hand,
        ...deck
      ]

      // Unassign player
      players.delete(event.payload.socketID)

      return createEvent(clientEvents, "return_opponent_hand")
    }

    return clientEvents
  }, [])
}

let events = []
let nextSocketID = 0
wsServer.on('request', function(request) {
  if (!originIsAllowed(request.origin)) {
    // Make sure we only accept requests from an allowed origin
    request.reject()
    console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.')
    return
  }
  
  var connection = request.accept('echo-protocol', request.origin)
  console.log((new Date()) + ' Player connected')

  connection.socketID = nextSocketID++
  events = createEvent(events, 'player_connected', { socketID: connection.socketID })

  connection.send(JSON.stringify(getClientEvents(events, connection.socketID)))

  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      console.log('Received Message: ' + message.utf8Data)
      connection.sendUTF(message.utf8Data)
    }
    else if (message.type === 'binary') {
      console.log('Received Binary Message of ' + message.binaryData.length + ' bytes')
      connection.sendBytes(message.binaryData)
    }
  })
  connection.on('close', function(reasonCode, description) {
    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.')
    events = createEvent(events, 'player_disconnected', { socketID: connection.socketID })
  })
})
