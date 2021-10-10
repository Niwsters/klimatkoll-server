import { Subject, Observable } from 'rxjs'
import { RoomController } from './room'
import { filter, map } from 'rxjs/operators'
import { connection as WebSocketConnection } from 'websocket'

export class SocketEvent {
  context: string
  type: string
  payload: any

  constructor(type: string, context: string, payload: any = {}) {
    this.type = type
    this.context = context
    this.payload = payload
  }
}

export class Socket {
  static nextSocketID: number = 0

  socketID: number
  connection: WebSocketConnection

  events$: Subject<SocketEvent> = new Subject()
  get closed$(): Observable<undefined> {
    return this.events$.pipe(
      filter((event: SocketEvent) => event.type === "disconnected"),
      map(() => undefined)
    )
  }

  static isProtocolAllowed(protocol: string): boolean {
    if (protocol === 'sv' || protocol === 'en')
      return true

    return false
  }

  static parseMessage(msg: any): SocketEvent {
    let event: SocketEvent | undefined

    if (msg.type == 'binary') {
      event = JSON.parse(msg.binaryData)
    }

    if (msg.type == 'utf8') {
      event = JSON.parse(msg.utf8Data)
    }

    if (!event) throw new Error("Failed to parse socket message of type " + msg.type)

    return event
  }

  constructor(connection: WebSocketConnection, protocol: string) {
    this.connection = connection
    this.socketID = Socket.nextSocketID++

    connection.send(JSON.stringify({ type: "socketID", payload: this.socketID }))
    connection.on('close', () => this.receiveEvent(new SocketEvent('disconnected', 'socket')))
    connection.on('message', (msg: any) => this.receiveEvent(Socket.parseMessage(msg)))
  }

  receiveEvent(event: SocketEvent) {
    this.events$.next({
      ...event,
      payload: { socketID: this.socketID, ...event.payload }
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
