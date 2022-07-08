import { Subject } from 'rxjs'
import { connection as WebSocketConnection } from 'websocket'

export interface ISocketEvent {
  event_type: string
  payload: any
  socketID: number
}

export class SocketEvent {
  event_type: string
  payload: any
  socketID: number

  constructor(event_type: string, socketID: number, payload: any = {}) {
    this.event_type = event_type
    this.payload = payload
    this.socketID = socketID
  }

  get type(): string {
    return this.event_type
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

  static isProtocolAllowed(languages: string[], protocol: string): boolean {
    return languages.includes(protocol)
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

  private language: string

  constructor(connection: WebSocketConnection, protocol: string) {
    this.connection = connection
    this.socketID = Socket.nextSocketID++
    this.language = protocol 

    connection.send(JSON.stringify({ type: "socket_id", payload: { socketID: this.socketID } }))
    connection.on('close', () => this.receiveEvent(new SocketEvent('disconnected', this.socketID)))
    connection.on('message', (msg: any) => this.receiveEvent(Socket.parseMessage(msg)))
  }

  receiveEvent(receivedEvent: ISocketEvent) {
    const event = new SocketEvent(receivedEvent.event_type, this.socketID, receivedEvent.payload)
    event.payload = { socketID: this.socketID, language: this.language, ...event.payload }
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
