import seedrandom from 'seedrandom'
import { Subject } from 'rxjs'
import { SocketEvent, SocketResponse } from './socket'
import { GameState, GameEvent } from './game'
import { GetDeck } from './card-fetcher'

export class State {
  private getDeck: GetDeck
  private games: GameState[] = []

  constructor(deck: GetDeck) {
    this.getDeck = deck
  }

  new(props: any = {}): State {
    return Object.assign(new State(this.getDeck), {...this, ...props})
  }

  getMethod(event: SocketEvent): (payload: any) => [State, SocketResponse[]] {
    const name = event.type
    let method: any = () => [this.new(), []]

    const ownMethod: any = (this as any)[name]
    if (ownMethod !== undefined)
      method = ownMethod
    else if (GameState.hasOwnProperty(name)) {
      method = () => this.delegate(event)
    }

    return method
  }

  callGameStateMethod(_: string, game: GameState, event: SocketEvent): GameState {
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

    let responses: SocketResponse[] = [];
    [state.games[gameIndex], responses] = GameState.delegate(state.games[gameIndex], event);

    return [state, responses]
  }

  create_game(payload: any, seed: string): [State, SocketResponse[]] {
    const socketID = payload.socketID
    const roomID = payload.roomID

    if (socketID === undefined)
      throw new Error("Can't create game: Must provide socketID in payload")

    if (roomID === undefined)
      throw new Error("Can't create game: Must provide roomID in payload")

    let gameState = new GameState(roomID, seed, this.getDeck(payload.language), socketID);
    let responses: SocketResponse[] = [];
    [gameState, responses] = GameState.consumeResponses(gameState);

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

  private removeGame(socketID: number): [State, SocketResponse[]] {
    let state = this.new()

    const game = state.games.find(game => game.player1.socketID === socketID || game.player2?.socketID === socketID)

    if (!game)
      return [state, []]

    const responses: SocketResponse[] = []
    responses.push({
      event_id: game.clientEvents.length,
      socketID: game.player1.socketID,
      event_type: "game_removed",
      payload: {}
    })

    if (game.player2)
      responses.push({...responses[0], event_id: responses[0].event_id + 1, socketID: game.player2.socketID })

    state.games = state.games.filter((game: GameState) => {
      return game.player1.socketID !== socketID &&
      (game.player2 === undefined || game.player2.socketID !== socketID) &&
      socketID !== undefined
    })

    return [state, responses]
  }

  leave_game(payload: any): [State, SocketResponse[]] {
    return this.removeGame(payload.socketID)
  }

  disconnected(payload: any): [State, SocketResponse[]] {
    const socketID = payload.socketID
    return this.removeGame(socketID)
  }
}

export class GameService {
  state: State
  responses$: Subject<SocketResponse> = new Subject()

  constructor(deck: GetDeck) {
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
    try {
      let responses: SocketResponse[] = [];
      [this.state, responses] = this.state.getMethod(event).bind(this.state)(event.payload);
      responses.forEach((r: SocketResponse) => this.responses$.next(r))
    } catch(e) {
      console.log(`Error processing event: ${e}`)
    }
  }
}
