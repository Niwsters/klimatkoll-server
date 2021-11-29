import { Subject, Observable } from 'rxjs'
import { RoomController } from './room'
import { filter, map } from 'rxjs/operators'
import { connection as WebSocketConnection } from 'websocket'

export class SocketEvent {
  event_type: string
  payload: any

  get type(): string {
    return this.event_type
  }

  constructor(event_type: string, payload: any = {}) {
    this.event_type = event_type
    this.payload = payload
  }
}

export interface SocketResponse {
  socketID: number
  event_id: number
  event_type: string
  payload: any
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

    connection.send(JSON.stringify({ type: "socket_id", payload: { socketID: this.socketID } }))
    connection.on('close', () => this.receiveEvent(new SocketEvent('disconnected')))
    connection.on('message', (msg: any) => this.receiveEvent(Socket.parseMessage(msg)))
  }

  receiveEvent(event: SocketEvent) {
    event.payload = { socketID: this.socketID, ...event.payload }
    this.events$.next(event)
  }

  sendEvent(eventType: string, payload: any = {}) {
    const data = {
      type: eventType,
      payload: payload
    }

    this.connection.send(JSON.stringify(data))
  }
}
