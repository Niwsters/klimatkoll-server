import { createEvent } from '../event/event'
import { Card } from 'core/card'
import { DECK_POSITION } from 'core/constants'
import { GameState } from '../core/gamestate'
import { Factory } from './test-factory'
import { spec } from './spec'

function nextCard(state: GameState, card: Card): GameState {
  const event = createEvent(0, "next_card", {card})
  return state.next_card(event)[0]
}

export default function main() {
  const card = new Card(13, "blargh", DECK_POSITION)
  const card2 = new Card(1, "honk", DECK_POSITION)

  const test = spec()
    .when(() => nextCard(Factory.GameState(), card))

  // Creates a new deck card if none exists
  test
    .expect(state => state.deck.cards)
    .toEqual([card])

  // Replaces existing deck card
  test
    .when(state => nextCard(state, card2))
    .expect(state => state.deck.cards)
    .toEqual([card2])
}
