import { Card } from './card'
import { Positions } from './move'

const DECK_POSITION_X = 800
const DECK_POSITION_Y = 150
const CARD_SCALE = 0.5

export const deckPositions = (deck: Card[]): Positions => {
  const positions: Positions = {}
  deck.forEach(card => {
    positions[card] = {
      card,
      x: DECK_POSITION_X,
      y: DECK_POSITION_Y,
      rotation: 0,
      scale: CARD_SCALE
    }
  })
  return positions
}
