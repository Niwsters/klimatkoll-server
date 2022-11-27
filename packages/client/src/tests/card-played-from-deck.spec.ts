import { Card } from 'core/card'
import { EventToAdd, createEvent } from '../event/event'
import { GameState } from 'core/gamestate'
import { Factory } from './test-factory'
import { spec } from './spec'

function playCard(state: GameState, card: Card, position: number): [GameState, EventToAdd[]] {
  const event = createEvent(0, 'card_played_from_deck', {
    card: card,
    position: position
  })
  return state.card_played_from_deck(event)
}

export default function main() {
  const card = new Card(0, "blargh")
  const card2 = new Card(1, "honk")
  const card3 = new Card(2, "1337")

  const test = spec().when(() => Factory.GameState())

  // adds card to emissions line
  test.when((state: GameState) => playCard(state, card, 0)[0])
      .expect((state: GameState) => state.emissionsLine.cards.map(c => c.id))
      .toEqual([-1, card.id, -2])

  // adds card to given position
  test
    .when((state: GameState) => {
      state = playCard(state, card, 0)[0]
      state = playCard(state, card2, 2)[0]
      state = playCard(state, card3, 2)[0]
      return state
    })
    .expect((state: GameState) => state.emissionsLine.cards.filter(c => !c.isSpace).map(c => c.id))
    .toEqual([card.id, card3.id, card2.id])

  // flips card
  test
    .when((state: GameState) => {
      card.flipped = false
      state = playCard(state, card, 0)[0]
      return state
    })
    .expect((state: GameState) => state.cards.find(c => c.id === card.id)?.flipped)
    .toEqual(true)
}
