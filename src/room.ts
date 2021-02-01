import { GameEvent, EventHandler } from './event'
import { Socket } from './socket';
import seedrandom = require('seedrandom');

export interface Room {
  events: GameEvent[]
}

export class RoomHandler {
  rooms: Map<string, Room> = new Map()
  sockets: Socket[] = []

  getRoomSockets(roomID: string): Socket[] {
    return this.sockets.filter(s => s.roomID == roomID)
  }

  addSocket(socket: Socket) {
    console.log((new Date()) + ' Player connected')

    this.sockets.push(socket)

    socket.connection.send(JSON.stringify({ type: "socketID", payload: socket.socketID }))

    socket.connection.on('message', (msg: any) => {
      if (msg.type == 'binary') {
        const event = JSON.parse(msg.binaryData)
        event.payload = { socketID: socket.socketID, ...event.payload }

        if (event.context == "menu") {
          if (event.type == "create_game") {
            this.joinRoom(event.payload.roomID, socket)
          }

          if (event.type == "join_game") {
            this.joinRoom(event.payload.roomID, socket)
          }
        } else if (event.context == "game") {
          if (!socket.roomID) throw new Error("Socket with ID " + socket.socketID + " not connected to a room")
          this.addGameEvent(socket.roomID, event.type, { socketID: socket.socketID, ...event.payload })
        } else if (event.context == "room") {
          if (event.type == "exit_game") {
            const roomID = socket.roomID

            if (!roomID) {
              console.log("Warning: Socket trying to exit room when it is not in a room")
              return
            }

            const roomSockets = this.getRoomSockets(roomID)
            roomSockets.forEach((socket: Socket) => {
              this.sendEventToClient(socket, "room_left", { socketID: event.payload.socketID })
            })

            socket.roomID = undefined

            this.rooms.delete(roomID)
          }
        }
      }
    })
  }

  joinRoom(roomID: string, socket: Socket) {
    const room = this.rooms.get(roomID) || { sockets: [], events: [] }
    const roomSockets = this.getRoomSockets(roomID)

    // Avoid joining room twice
    if (roomSockets.find(s => s.socketID == socket.socketID)) {
      return
    }

    // Maximum two players per game
    if (roomSockets.length >= 2) {
      this.sendEventToClient(socket, "room_full")
      return
    }

    socket.roomID = roomID

    this.sendEventToClient(socket, "room_joined")

    roomSockets.push(socket)
    this.rooms.set(roomID, room)

    this.addGameEvent(roomID, "game_started", { seed: this.generateSeed() })
    this.addGameEvent(roomID, "player_connected", { socketID: socket.socketID })
  }

  generateSeed(): string {
     let result           = '';
     const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
     const charactersLength = characters.length;
     for ( var i = 0; i < 10; i++ ) {
        result += characters.charAt(Math.floor(seedrandom()() * charactersLength));
     }
     return result;
  }

  sendEventToClient(socket: Socket, eventType: string, payload: any = {}) {
    const data = {
      type: eventType,
      payload: payload
    }

    socket.connection.send(JSON.stringify(data))
  }

  addGameEvent(roomID: string, eventType: string, payload: any) {
    const room = this.rooms.get(roomID)
    if (!room) throw new Error("Can't find room with ID: " + roomID)

    // Add event to server events
    room.events.push(EventHandler.createServerEvent(eventType, payload))

    // Notify clients of changes
    const state = EventHandler.getServerState(room.events)
    this.getRoomSockets(roomID).forEach((socket: Socket) => {
      this.sendEventToClient(socket, "events", state.clientEvents)
    })
  }
}
