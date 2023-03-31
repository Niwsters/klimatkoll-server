import { Card } from './card'
import { CardPosition } from './position'
import { SpaceCards, focusedCards } from './emissions_line'

export type Reflection = {
  card: Card,
  reflected: Card
}

export const reflections = (
  selectedCards: Card[],
  spaceCards: SpaceCards,
  positions: CardPosition[],
  mouseX: number,
  mouseY: number
): Reflection[] => {
  let reflections: Reflection[] = []
  for (const focusedCard of focusedCards(spaceCards, positions, mouseX, mouseY)) {
    const selectedCard = selectedCards[0]
    if (selectedCard !== undefined) {
      reflections.push({ card: focusedCard, reflected: selectedCard })
    }
  }
  return reflections
}
