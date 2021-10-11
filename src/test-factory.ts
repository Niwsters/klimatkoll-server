import { GameState } from './game'
import { Card } from './cards'

export class Factory {
  static Deck() {
    return [
      new Card(1, 'blargh', 10)
    ]
  }

  static GameState() {
    return new GameState("blargh", 'some-seed', Factory.Deck(), 3)
  }
}
