import seedrandom from 'seedrandom'
import { Subject } from 'rxjs'
import { SocketEvent, SocketResponse } from './socket'
import { GameState, GameEvent } from './game'
import { Card } from './cards'

export class State {
  deck: Card[]
  games: GameState[] = []

  constructor(deck: Card[]) {
    this.deck = deck
  }

  static getGame(state: State, socketID: number): GameState {
    const game = state.games
      .find((g: GameState) => g.player1.socketID === socketID ||
                              (g.player2 && g.player2.socketID === socketID))

    if (!game)
      throw new Error(`Can't find game containing player with socketID: ${socketID}`)

    return game
  }

  new(props: any = {}): State {
    return Object.assign(new State(this.deck), {...this, ...props})
  }

  createGame(payload: any, seed: string): [State, SocketResponse[]] {
    const socketID = payload.socketID
    const roomID = payload.roomID

    if (socketID === undefined)
      throw new Error("Can't create game: Must provide socketID in payload")

    if (roomID === undefined)
      throw new Error("Can't create game: Must provide roomID in payload")

    const gameState = new GameState(roomID, seed, [...this.deck], socketID)

    const responses = gameState.clientEvents
      .map((event: GameEvent) => {
        return {
          ...event,
          socketID: socketID
        }
      })

    return [
      this.new({
        games: [
          ...this.games,
          gameState
        ]
      }),
      responses
    ]
  }

  /*
  static createGame(
    state: State,
    socketID: number,
    seed: string,
    roomID: string
  ): [State, SocketResponse[]] {
    const gameState = new GameState(roomID, seed, [...state.deck], socketID)
    const responses = gameState.clientEvents
      .map((event: GameEvent) => {
        return {
          ...event,
          socketID: socketID
        }
      })

    return [
      {
        ...state,
        games: [
          ...state.games,
          gameState
        ]
      },
      responses
    ]
  }
  */

  /*
  static handleEvent(
    state: GameState, event: SocketEvent
  ): [State, SocketResponse[]] {
  }
  */
}

export class GameService {
  state: State
  responses$: Subject<SocketResponse> = new Subject()

  constructor(deck: Card[]) {
    this.state = new State(deck)
  }

  newSeed(): string {
    let result           = ''
    const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    for ( var i = 0; i < 10; i++ ) {
      result += characters.charAt(Math.floor(seedrandom()() * charactersLength))
    }
    return result
  }

  createGame(event: SocketEvent) {
    /*
    let responses: SocketResponse[]
    [this.state, responses] = this.state.createGame(event.payload, newSeed())
    [this.state, responses] = State.createGame(
      this.state,
      event.payload.socketID,
      this.newSeed(),
      event.payload.roomID
    )
    responses.forEach((r: SocketResponse) => this.responses$.next(r))
    */
  }

  /*
  joinGame(event: SocketEvent) {
    let responses: SocketResponse[]
    [this.state, responses] = State.joinGame(this.state, event)
  }
  */

  handleEvent(event: SocketEvent) {
    switch(event.type) {
      case "create_game": {
        this.createGame(event)
        break
      }

      /*
      case "join_game": {
        this.joinGame(event)
        break
      }
      */
    }
  }
}
