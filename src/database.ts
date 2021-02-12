import { server as WebSocketServer, connection as WebSocketConnection } from 'websocket'

export class Socket {
  static nextSocketID: number = 0

  socketID: number
  roomID?: string
  connection: WebSocketConnection

  constructor(connection: WebSocketConnection) {
    this.connection = connection
    this.socketID = Socket.nextSocketID++
  }
}

export class GameEvent {
  event_id: number
  event_type: string
  payload: any

  constructor(eventID: number, type: string, payload: any = {}) {
    this.event_id = eventID
    this.event_type = type
    this.payload = payload
  }
}

export class Room {
  id: string
  events: GameEvent[] = []
  newGameVotes: Set<number> = new Set()

  constructor(id: string) {
    this.id = id
  }
}

export class Database {
  sockets: Socket[] = []
  rooms: Room[] = []
  lastGameEventID: number = 0

  getRoomSockets(roomID: string): Socket[] {
    return this.sockets.filter(s => s.roomID == roomID)
  }

  disconnectSocketFromRoom(socket: Socket): void {
    const roomID = socket.roomID

    if (!roomID) {
      console.log("Warning: Socket trying to exit room when it is not in a room")
      return
    }
    socket.roomID = undefined
    this.deleteRoom(roomID)
  }

  getRoom(roomID: string): Room {
    const room = this.rooms.find(r => r.id == roomID)

    if (!room) throw new Error("Could not find room with ID: " + roomID)

    return room
  }

  roomExists(roomID: string): boolean {
    return this.rooms.findIndex(r => r.id == roomID) > -1
  }

  createRoom(roomID: string): void {
    this.rooms.push(new Room(roomID))
  }

  deleteRoom(roomID: string): void {
    this.rooms = this.rooms.filter(r => r.id != roomID)
  }

  addSocket(socket: Socket): void {
    this.sockets.push(socket)
  }

  deleteSocket(socket: Socket): void {
    this.sockets = this.sockets.filter(s => s != socket)
  }

  addGameEvent(roomID: string, eventType: string, payload: any = {}): void {
    const event = new GameEvent(this.lastGameEventID++, eventType, payload)
    this.getRoom(roomID).events.push(event)
  }

  resetRoom(roomID: string) {
    const room = this.getRoom(roomID)
    room.events = []
    room.newGameVotes = new Set()
  }
}
