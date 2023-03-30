import { Card } from './card'
import { focusedCards } from './hand'

export const getSelected = (
  hand: Card[],
  mouseX: number,
  mouseY: number
): Card[] =>
  focusedCards(hand, mouseX, mouseY)
