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

