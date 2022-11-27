import { Card } from 'core/card'
import { Factory } from './test-factory'
import { GameState } from 'core/gamestate'
import { DECK_POSITION } from 'core/constants'
import { spec } from './spec'
import { Event, createEvent } from '../event/event'


function drawCardEvent(socketID: number): Event {
  return createEvent(0, "draw_card", { card: card, socketID })
}

function drawCard(state: GameState, socketID: number): GameState {
  return state.draw_card(drawCardEvent(socketID))[0]
}

const card = new Card(0, "some-card")

export default function main() {
  const test = spec()
    .when(() => {
      const state = Factory.GameState()
      state.socketID = 3
      return state
    })

  const playerHand = test
    .when(state => drawCard(state, 3))

  // Puts card in player's hand
  playerHand
    .expect((state: GameState) => state.hand.cards.map(c => c.id))
    .toEqual([card.id])

  // Puts card initiallity at deck position
  playerHand
    .expect((state: GameState) => state.hand.cards[0].position)
    .toEqual(DECK_POSITION)

  // Puts card in opponent's hand
  test
    .when(state => drawCard(state, 4))
    .expect((state: GameState) => state.opponentHand.cards.map(c => c.id))
    .toEqual([card.id])
}
