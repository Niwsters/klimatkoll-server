import { SocketEvent } from './socket'
import { GameState } from './game'

export class State {
  games: GameState[] = []
}

export class GameService {
  state: State = new State()

  handleEvent(event: SocketEvent) {
    switch(event.type) {
      case "create_game": {
        const [state, response] = State.createGame(event)
        break
      }
    }
  }
}
