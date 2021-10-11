import { SocketEvent, SocketResponse } from './socket'
import { GameState, GameEvent } from './game'
import { Card } from './cards'

export class State {
  deck: Card[]
  games: GameState[] = []

  constructor(deck: Card[]) {
    this.deck = deck
  }

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
}

export class GameService {
  state: State

  constructor(deck: Card[]) {
    this.state = new State(deck)
  }

  handleEvent(event: SocketEvent) {
    /*
    switch(event.type) {
      case "create_game": {
        const [state, response] = State.createGame(event)
        break
      }
    }
    */
  }

  static createGame() {

  }
}
