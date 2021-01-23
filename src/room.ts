import { GameEvent, EventHandler } from './event'
import { Socket } from './socket';

export interface Room {
  sockets: Socket[],
  events: GameEvent[]
}

export class RoomHandler {
  rooms: Map<string, Room> = new Map()

  joinRoom(roomID: string, socket: Socket) {
    const room = this.rooms.get(roomID) || { sockets: [], events: [] }

    // Avoid joining room twice
    if (room.sockets.find(s => s.socketID == socket.socketID)) {
      return
    }

    socket.connection.send(JSON.stringify({
      type: "room_joined"
    }))

    room.sockets.push(socket)
    this.rooms.set(roomID, room)

    this.addGameEvent(roomID, "player_connected", { socketID: socket.socketID })
  }

  addGameEvent(roomID: string, eventType: string, payload: any) {
    const room = this.rooms.get(roomID)
    if (!room) throw new Error("Can't find room with ID: " + roomID)

    // Add event to server events
    room.events.push(EventHandler.createServerEvent(eventType, payload))

    // Notify clients of changes
    const state = EventHandler.getServerState(room.events)
    const data = {
      type: "events",
      payload: state.clientEvents
    }
    room.sockets.forEach((socket: Socket) => {
      socket.connection.send(JSON.stringify(data))
    })
  }
}
