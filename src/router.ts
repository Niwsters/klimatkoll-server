import seedrandom = require('seedrandom');
import { Database, Socket } from './database';
import { RoomController } from './room';

interface SocketEvent {
  context: string
  type: string
  payload: any
}

export class Router {
  db: Database
  roomCtrl: RoomController

  constructor(db: Database, roomController: RoomController) {
    this.db = db
    this.roomCtrl = roomController
  }

  addSocket(socket: Socket) {
    this.db.addSocket(socket)

    socket.connection.send(JSON.stringify({ type: "socketID", payload: socket.socketID }))

    socket.connection.on('close', (reasonCode, description) => {
      this.roomCtrl.disconnectSocketFromRoom(socket)
      // Remove socket from room handler on socket disconnect
      this.db.deleteSocket(socket)
    })

    socket.connection.on('message', (msg: any) => {
      if (msg.type == 'binary') {
        const event: SocketEvent = JSON.parse(msg.binaryData)
        event.payload = { socketID: socket.socketID, ...event.payload }

        if (event.context == "menu") {
          if (event.type == "create_game") {
            this.roomCtrl.createRoom(event.payload.roomID, socket)
          }

          if (event.type == "join_game") {
            this.roomCtrl.joinRoom(event.payload.roomID, socket)
          }
        } else if (event.context == "game") {
          this.roomCtrl.addGameEvent(socket, event.type, event.payload)
        } else if (event.context == "room") {
          if (event.type == "exit_game") {
            this.roomCtrl.disconnectSocketFromRoom(socket)
          } else if (event.type == "vote_new_game") {
            this.roomCtrl.voteNewGame(socket)
          }
        }
      }
    })
  }
}
