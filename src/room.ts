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

    socket.connection.on('message', (msg: any) => {
      if (msg.type == 'binary') {
        const event = JSON.parse(msg.binaryData)

        console.log("Event received from client: ", event)

        if (event.context == "game") {
          const roomID = this.getSocketRoomID(socket)
          this.addGameEvent(roomID, event.type, { socketID: socket.socketID, ...event.payload })
        }
      }
    })

    room.sockets.push(socket)
    this.rooms.set(roomID, room)

    this.addGameEvent(roomID, "player_connected", { socketID: socket.socketID })
  }

  getSocketRoomID(socket: Socket): string {
    const roomID = Array.from(this.rooms.keys()).find((roomID: string) => {
      const room = this.rooms.get(roomID)

      if (!room) return false

      return room.sockets.find(s => s.socketID == socket.socketID) ? true : false
    })

    if (!roomID) throw new Error("Can't find room which contains socketID " + socket.socketID)

    return roomID
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

    console.log(room.events)

    room.sockets.forEach((socket: Socket) => {
      socket.connection.send(JSON.stringify(data))
    })
  }
}
