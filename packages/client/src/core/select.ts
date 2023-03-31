import { Card } from './card'
import { focusedCards } from './hand'
import { MouseClickedEvent } from './mouse'

export const getSelected = (
  selected: Card[],
  hand: Card[],
  mouseClickedEvents: MouseClickedEvent[]
): Card[] => {
  for (const { x, y } of mouseClickedEvents) {
    selected = focusedCards(hand, x, y)
  }
  return selected
}
