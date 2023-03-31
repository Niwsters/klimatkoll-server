import { Card } from './card'
import { SpaceCards, focusedSpaceCards } from './emissions_line'

export type Reflection = {
  card: Card,
  reflected: Card
}

export const reflections = (
  selectedCards: Card[],
  spaceCards: SpaceCards,
  mouseX: number,
  mouseY: number
): Reflection[] => {
  let reflections: Reflection[] = []
  for (const focusedCard of focusedSpaceCards(spaceCards, mouseX, mouseY)) {
    const selectedCard = selectedCards[0]
    if (selectedCard !== undefined) {
      reflections.push({ card: focusedCard, reflected: selectedCard })
    }
  }
  return reflections
}
