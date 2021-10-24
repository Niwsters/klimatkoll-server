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

  getGame(filters: any): GameState {
    let game: GameState | undefined
    const socketID = filters.socketID
    const roomID = filters.roomID
    if (socketID !== undefined)
      game = this.games
        .find((g: GameState) => g.player1.socketID === socketID ||
                                (g.player2 && g.player2.socketID === socketID))
    else if (roomID !== undefined)
      game = this.games
        .find((g: GameState) => g.roomID === roomID)

    if (!game)
      throw new Error(`Can't find game using filters: ${JSON.stringify(filters)}`)

    return game
  }

  new(props: any = {}): State {
    return Object.assign(new State(this.deck), {...this, ...props})
  }

  getMethod(name: string): (payload: any) => [State, SocketResponse[]] {
    const method: any = (this as any)[name];

    if (method === undefined)
      return () => [this.new(), []];

    return method
  }

  create_game(payload: any, seed: string): [State, SocketResponse[]] {
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

  join_game(payload: any): [State, SocketResponse[]] {
    const games = [...this.games]
    const game_i = this.games.findIndex(g => g.roomID === payload.roomID)

    games[game_i] = GameState["playerConnected"](games[game_i], payload)
    const game = games[game_i]
    
    const c1r = game.clientEvents
      .map((event: GameEvent) => {
        return {
          ...event,
          socketID: game.player1.socketID
        }
      })

    let c2r: SocketResponse[] = []
    if (game.player2) {
      const player2 = game.player2
      c2r = game.clientEvents
        .map((event: GameEvent) => {
          return {
            ...event,
            socketID: player2.socketID
          }
        })
    }

    return [this.new({ games: games }), [...c1r, ...c2r]]
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

  handleEvent(event: SocketEvent) {
    let responses: SocketResponse[] = [];
    [this.state, responses] = this.state.getMethod(event.type).bind(this.state)(event.payload);
    responses.forEach((r: SocketResponse) => this.responses$.next(r))
  }
}
