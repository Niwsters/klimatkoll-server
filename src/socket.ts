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
      if (msg.type == 'binary') {
        const event: SocketEvent = JSON.parse(msg.binaryData)
        event.payload = { socketID: this.socketID, ...event.payload }
        this.events$.next(event)
      }
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
