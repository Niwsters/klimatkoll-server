import { Card } from './card'
import { Positions } from './move'
import { tail } from './util'

const DISCARD_PILE_POSITION_X = 800
const DISCARD_PILE_POSITION_Y = 350
const CARD_SCALE = 0.5

export const discardPilePositions = (discardPile: Card[]): Positions => {
  const positions: Positions = {}
  tail(discardPile).forEach(card => {
    positions[card] = {
      card,
      x: DISCARD_PILE_POSITION_X,
      y: DISCARD_PILE_POSITION_Y,
      rotation: 0,
      scale: CARD_SCALE
    }
  })
  return positions
}
