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
    const roomID = payload.roomID
    const game_i = this.games.findIndex(g => g.roomID === roomID)
    if (game_i === -1)
      throw new Error("Can't find game with roomID: " + roomID)

    games[game_i] = GameState["playerConnected"](games[game_i], payload)

    const game = games[game_i]
    
    const c1r = game.clientEvents
      .map((event: GameEvent) => {
        return {
          ...event,
          socketID: game.player1.socketID
        }
      })

    if (!game.player2)
      throw new Error("gamestate.player2 is undefined")

    const player2 = game.player2
    const c2r: SocketResponse[] = game.clientEvents
      .map((event: GameEvent) => {
        return {
          ...event,
          socketID: player2.socketID
        }
      })

    return [this.new({ games: games }), [...c1r, ...c2r]]
  }

  disconnected(payload: any): [State, SocketResponse[]] {
    let state = this.new()
    const socketID = payload.socketID

    state.games = state.games.filter((game: GameState) => {
      return game.player1.socketID !== socketID &&
      (game.player2 === undefined || game.player2.socketID !== socketID) &&
      socketID !== undefined
    })

    return [state, []]
  }
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
    [this.state, responses] = this.state.getMethod(event.event_type).bind(this.state)(event.payload);
    responses.forEach((r: SocketResponse) => this.responses$.next(r))
  }
}
