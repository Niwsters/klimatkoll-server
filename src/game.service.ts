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

  getMethod(event: SocketEvent): (payload: any) => [State, SocketResponse[]] {
    const name = event.type
    const socketID = event.socketID
    let method: any = () => [this.new(), []]

    const ownMethod: any = (this as any)[name]
    if (ownMethod !== undefined)
      method = ownMethod
    else if (GameState.hasOwnProperty(name)) {
      method = () => this.delegate(event)
    }

    return method
  }

  getResponses(oldGame: GameState): [GameState, SocketResponse[]] {
    let game = {...oldGame}
    const c1r = GameState.getPlayer1Responses(game)
    const c2r = GameState.getPlayer2Responses(game)
    game.clientEvents = []
    return [game, [...c1r, ...c2r]]
  }

  callGameStateMethod(name: string, game: GameState, event: SocketEvent): GameState {
    return (GameState as any)[event.type](game, event.payload)
  }

  getGameIndexBySocketID(socketID: number) {
    return this.games.findIndex((game: GameState) => 
      game.player1.socketID === socketID || (game.player2 !== undefined && game.player2.socketID === socketID)
    )
  }

  delegate(event: SocketEvent): [State, SocketResponse[]] {
    let state = this.new()
    const socketID = event.socketID
    const gameIndex = this.getGameIndexBySocketID(socketID)

    state.games[gameIndex] = this.callGameStateMethod(event.type, state.games[gameIndex], event);

    let responses: SocketResponse[] = [];
    [state.games[gameIndex], responses] = this.getResponses(state.games[gameIndex]);

    return [state, responses]
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

    gameState.clientEvents = []

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

    game.clientEvents = []

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
    [this.state, responses] = this.state.getMethod(event).bind(this.state)(event.payload);
    responses.forEach((r: SocketResponse) => this.responses$.next(r))
  }
}
