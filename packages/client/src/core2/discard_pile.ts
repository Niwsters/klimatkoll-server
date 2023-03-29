import { HEIGHT, WIDTH } from '../core/constants'
import { Card } from './card'

/*
const DISCARD_PILE_POSITION_X = WIDTH-100
const DISCARD_PILE_POSITION_Y = HEIGHT/2+154/2+20
const CARD_SCALE = 0.5

export type DiscardPile = { cards: Card[] }
const noCard: Card = {
  ...defaultCard("no-card"),
  visible: false,
  scale: CARD_SCALE
}

export function create(): DiscardPile {
  return { cards: [noCard] }
}

export function addCard(card: Card, currentTime: number): DiscardPile {
  card = {...card, flipped: true }
  card = move_x(card, DISCARD_PILE_POSITION_X, currentTime)
  card = move_y(card, DISCARD_PILE_POSITION_Y, currentTime)
  card = scale(card, CARD_SCALE, currentTime)

  return { cards: [card] }
}

export const update = (pile: DiscardPile, currentTime: number): DiscardPile => ({
  cards: pile.cards.map(c => updateCard(c, currentTime))
})
*/
