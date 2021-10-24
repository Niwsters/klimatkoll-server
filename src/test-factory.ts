import { GameState } from './game'
import { Card } from './cards'

export class GameStateFactory {
  createdBySocketID: number = 0
  _deck: Card[] = Factory.Deck.get()
  _seed: string = 'some-seed'
  _roomID: string = 'blargh'

  createdBy(socketID: number) {
    return this.new({ createdBySocketID: socketID })
  }

  roomID(roomID: string) {
    return this.new({ _roomID: roomID })
  }

  deck(deck: Card[]) {
    return this.new({ _deck: deck })
  }

  seed(seed: string) {
    return this.new({ _seed: seed })
  }

  new(props: any): GameStateFactory {
    return Object.assign(
      new GameStateFactory(),
      {...this, ...props})
  }

  get(): GameState {
    return new GameState(this._roomID, this._seed, this._deck, this.createdBySocketID)
  }
}

export class DeckFactory {
  get(): Card[] {
    return [
      new Card(1, 'blargh', 10)
    ]
  }
}

export class Factory {
  static get Deck(): DeckFactory {
    return new DeckFactory()
  }

  static get GameState(): GameStateFactory {
    return new GameStateFactory()
  }

  /*
  static GameState() {
    return new GameState("blargh", 'some-seed', Factory.Deck(), 3)
  }
  */
}
