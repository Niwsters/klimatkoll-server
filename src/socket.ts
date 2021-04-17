import { Subject } from 'rxjs'
import { RoomController } from './room'
import { filter } from 'rxjs/operators'
import { connection as WebSocketConnection } from 'websocket'

export interface SocketEvent {
  context: string
  type: string
  payload: any
}

export class Socket {
  static nextSocketID: number = 0

  socketID: number
  connection: WebSocketConnection

  events$: Subject<SocketEvent> = new Subject()
  closed$: Subject<undefined> = new Subject()

  constructor(connection: WebSocketConnection) {
    this.connection = connection
    this.socketID = Socket.nextSocketID++

    connection.send(JSON.stringify({ type: "socketID", payload: this.socketID }))

    connection.on('close', () => {
      this.closed$.next()
    })

    connection.on('message', (msg: any) => {
      let event: SocketEvent | undefined

      if (msg.type == 'binary') {
        event = JSON.parse(msg.binaryData)
      }

      if (msg.type == 'utf8') {
        event = JSON.parse(msg.utf8Data)
      }

      if (!event) throw new Error("Failed to parse socket message of type " + msg.type)
      event.payload = { socketID: this.socketID, ...event.payload }
      this.events$.next(event)
    })
  }

  sendEvent(eventType: string, payload: any = {}) {
    const data = {
      type: eventType,
      payload: payload
    }

    this.connection.send(JSON.stringify(data))
  }
}
