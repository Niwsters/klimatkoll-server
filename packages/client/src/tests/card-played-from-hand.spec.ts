import { Card } from 'core/card'
import { createEvent } from '../event/event'
import { GameState } from 'core/gamestate'
import { Factory } from './test-factory'
import { spec } from './spec'

function playCard(state: GameState, card: Card, position: number, opponentHand: boolean = false): GameState {
  if (opponentHand)
    state.opponentHand = state.opponentHand.addCard(card)
  else
    state.hand = state.hand.addCard(card)

  const event = createEvent(0, 'card_played_from_hand', {
    socketID: state.socketID,
    cardID: card.id,
    position: position
  })
  return state.card_played_from_hand(event)[0]
}

function hasHandCard(state: GameState): boolean {
  return state.hand.cards.length !== 0
}

function hasOpponentHandCard(state: GameState): boolean {
  return state.opponentHand.cards.length !== 0
}

function emissionsLineCardIDs(state: GameState): number[] {
  return state.emissionsLine.cards.map(c => c.id)
}

function nonSpaceCardIDs(state: GameState): number[] {
  return state.cards.filter(c => !c.isSpace).map(c => c.id)
}

export default function main() {
  const card = new Card(0, "blargh")
  const card2 = new Card(1, "honk")
  const card3 = new Card(2, "1337")

  const test = spec().when(() => Factory.GameState())
  const cardPlayed = test.when(state => playCard(state, card, 0))

  // Adds card to EL
  cardPlayed
    .expect(emissionsLineCardIDs)
    .toEqual([-1, card.id, -2])

  // Removes card from hand
  cardPlayed
    .expect(hasHandCard)
    .toEqual(false)

  // Removes card from opponent hand
  test
    .when(state => playCard(state, card, 0, true))
    .expect(hasOpponentHandCard)
    .toEqual(false)

  // Plays card to given position
  test
    .when(state => {
      state = playCard(state, card, 0)
      state = playCard(state, card2, 2)
      return playCard(state, card3, 2)
    })
    .expect(nonSpaceCardIDs)
    .toEqual([card.id, card3.id, card2.id])
}
