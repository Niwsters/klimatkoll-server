import { GameState } from './game'
import { Card, CardData } from './cards'
import cards from './cards-sv'

interface GameStateSpec {
  createdBy?: number
  joinedBy?: number
  roomID?: string
  seed?: string
  deck?: Card[]
  dropEvents?: boolean
}

export class GameStateFactory {
  createdBySocketID: number = 0
  _deck: Card[] = Factory.Deck.get()
  _seed: string = 'some-seed'
  _roomID: string = 'blargh'

  createdBy(socketID: number): GameStateFactory {
    return this.new({ createdBySocketID: socketID })
  }

  roomID(roomID: string): GameStateFactory {
    return this.new({ _roomID: roomID })
  }

  seed(seed: string): GameStateFactory {
    return this.new({ _seed: seed })
  }

  new(props: any): GameStateFactory {
    return Object.assign(
      new GameStateFactory(),
      {...this, ...props})
  }

  get(spec: GameStateSpec = {}): GameState {
    const roomID = spec.roomID || "blargh"

    let state = new GameState(
      roomID,
      spec.seed || "some-seed",
      spec.deck || Factory.Deck.get(),
      spec.createdBy || 0
    )

    if (spec.joinedBy !== undefined) {
      state = GameState.playerConnected(state, { roomID: roomID, socketID: spec.joinedBy })
    }

    if (spec.dropEvents)
      state.clientEvents = []

    return state
  }
}

export class DeckFactory {
  get(): Card[] {
    let lastCardID = 0
    return cards.map((card: CardData) => {
      return {
        ...card,
        id: lastCardID++
      }
    })
  }
}

export class Factory {
  static get Deck(): DeckFactory {
    return new DeckFactory()
  }

  static get GameState(): GameStateFactory {
    return new GameStateFactory()
  }
}
