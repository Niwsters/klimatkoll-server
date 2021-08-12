import { filter } from 'rxjs/operators'

import { Socket, SocketEvent } from './socket';
import { Game } from './game';
import { CardData } from './cards';

/* FEATURES
 * - Disconnect from room
 * - Vote new game
 * - Create room
 * - Join room
 */

export class Room {
  id: string
  newGameVotes: Set<number> = new Set()
  game: Game

  get sockets(): Socket[] {
    return this.game.sockets
  }

  constructor(id: string, player1: Socket, cardData: CardData[]) {
    this.id = id
    this.game = new Game(player1, cardData)
    player1.sendEvent("room_joined", { roomID: this.id })
  }

  addNewGameVote(socket: Socket) {
    this.newGameVotes.add(socket.socketID)

    if (this.newGameVotes.size < 2) {
      return
    }

    // New game if both players voted
    this.sockets.forEach(s => s.sendEvent("new_game"))
    this.game.newGame()
    this.newGameVotes = new Set()
  }

  join(socket: Socket) {
    // Avoid joining room twice
    if (this.sockets.find(s => s.socketID == socket.socketID)) {
      console.log("Warning: Socket is trying to join the same room twice")
      return
    }

    // Maximum two players per game
    if (this.sockets.length >= 2) {
      socket.sendEvent("room_full")
      return
    }

    socket.sendEvent("room_joined", { roomID: this.id })
    this.game.addPlayer2(socket)
  }
}

export class RoomController {
  rooms: Room[] = []
  sockets: Socket[] = []
  cardData: CardData[]

  constructor(cardData: CardData[]) {
    this.cardData = cardData
  }

  addSocket(socket: Socket) {
    this.sockets.push(socket)

    // TODO: Remove menu context in client so we can have one single event context here
    socket.events$
      .pipe(filter((e: SocketEvent) => e.context == "room" || e.context == "menu"))
      .subscribe((event: SocketEvent) => {
        if (event.type == "create_game") {
          this.create(event.payload.roomID, socket)
        } else if (event.type == "join_game") {
          this.join(event.payload.roomID, socket)
        } else if (event.type == "exit_game") {
          this.disconnect(socket)
        } else if (event.type == "vote_new_game") {
          this.voteNewGame(socket)
        }
      })

    socket.closed$.subscribe(() => {
      this.disconnect(socket)
      this.sockets = this.sockets.filter(s => s != socket)
    })
  }

  disconnect(socket: Socket): void {
    const room = this.getSocketRoom(socket)
    if (!room) {
      return
    }

    room.game.unsubscribePlayers()

    room.sockets.forEach((socket: Socket) => {
      socket.sendEvent("room_left", { socketID: socket.socketID })
    })

    this.rooms = this.rooms.filter((r: Room) => r.id != room.id)
  }

  voteNewGame(socket: Socket): void {
    const room = this.getSocketRoom(socket)

    if (!room) {
      throw new Error("Can't find room containing socket: " + socket)
    }

    room.addNewGameVote(socket)
  }

  getRoom(roomID: string): Room {
    const room = this.rooms.find((r: Room) => r.id == roomID)

    if (!room) {
      throw new Error("Could not find room with ID: " + roomID)
    }

    return room
  }

  getSocketRoom(socket: Socket): Room | undefined {
    const room = Array.from(this.rooms.values()).find((r: Room) => {
      return r.sockets.findIndex((s: Socket) => s == socket) > -1
    })

    return room
  }

  roomExists(roomID: string): boolean {
    return this.rooms.findIndex((r: Room) => r.id == roomID) > -1
  }

  create(roomID: string, socket: Socket): void {
    if (this.roomExists(roomID)) {
      socket.sendEvent("room_exists")
      return
    }

    const room = new Room(roomID, socket, this.cardData)
    this.rooms.push(room)
  }

  join(roomID: string, socket: Socket): void {
    if (!this.roomExists(roomID)) {
      return
    }

    const room = this.getRoom(roomID)
    room.join(socket)
  }
}
