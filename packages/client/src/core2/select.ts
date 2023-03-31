import { Card } from './card'
import { focusedCards } from './hand'
import { Movements } from './move'

export const getSelected = (
  moves: Movements,
  hand: Card[],
  mouseX: number,
  mouseY: number
): Card[] =>
  focusedCards(moves, hand, mouseX, mouseY)
