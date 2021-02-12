import seedrandom = require('seedrandom');
import { Socket, Database, GameEvent } from './database';
import { GameState } from './game';

export class RoomController {
  db: Database

  constructor(db: Database) {
    this.db = db
  }

  disconnectSocketFromRoom(socket: Socket) {
    const roomID = socket.roomID

    if (!roomID) {
      console.log("Warning: Socket trying to exit room when it is not in a room")
      return
    }

    const roomSockets = this.db.getRoomSockets(roomID)
    roomSockets.forEach((socket: Socket) => {
      this.sendEventToClient(socket, "room_left", { socketID: socket.socketID })
    })

    socket.roomID = undefined

    this.db.deleteRoom(roomID)
  }

  voteNewGame(socket: Socket) {
    console.log("Vote new game!")
    const roomID = socket.roomID

    if (!roomID) {
      console.log("Warning: Socket trying to vote new game when it is not in a room")
      return
    }

    const sockets = this.db.getRoomSockets(roomID)

    const room = this.db.getRoom(roomID)

    room.newGameVotes.add(socket.socketID)
    console.log("Room:", room)

    if (room.newGameVotes.size < 2) return

    // If both players voted new game, reset events and start new game
    sockets.forEach(s => this.sendEventToClient(s, "new_game"))
    this.db.resetRoom(roomID)
    this.db.addGameEvent(roomID, "game_started", { seed: this.generateSeed() })
    sockets.forEach((socket: Socket) => {
      this.db.addGameEvent(roomID, "player_connected", { socketID: socket.socketID })
    })
  }

  createRoom(roomID: string, socket: Socket): void {
    // If room already exists, tell client
    if (this.db.roomExists(roomID)) {
      this.sendEventToClient(socket, "room_exists")
      return
    }

    // Else, create new room and join it
    this.db.createRoom(roomID)
    this.joinRoom(roomID, socket)
  }

  joinRoom(roomID: string, socket: Socket) {
    const room = this.db.getRoom(roomID)
    const roomSockets = this.db.getRoomSockets(roomID)

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

    this.addGameEvent(socket, "game_started", { seed: this.generateSeed() })
    this.addGameEvent(socket, "player_connected", { socketID: socket.socketID })
  }

  generateSeed(): string {
     let result           = ''
     const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
     const charactersLength = characters.length
     for ( var i = 0; i < 10; i++ ) {
        result += characters.charAt(Math.floor(seedrandom()() * charactersLength))
     }
     return result
  }

  sendEventToClient(socket: Socket, eventType: string, payload: any = {}) {
    const data = {
      type: eventType,
      payload: payload
    }

    socket.connection.send(JSON.stringify(data))
  }

  // Adds an event to a room's game
  addGameEvent(socket: Socket, eventType: string, payload: any) {
    if (!socket.roomID) {
      throw new Error("Socket with ID " + socket.socketID + " not connected to a room")
    }

    payload = { ...payload, socketID: socket.socketID }

    // Add event to server events
    this.db.addGameEvent(socket.roomID, eventType, payload)

    // Notify clients of changes
    const room = this.db.getRoom(socket.roomID)
    const state = GameState.fromEvents(room.events)
    this.db.getRoomSockets(socket.roomID).forEach((socket: Socket) => {
      this.sendEventToClient(socket, "events", state.clientEvents)
    })
  }
}
