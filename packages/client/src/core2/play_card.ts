import { Card } from './card'
import { focusedSpaceCards, SpaceCards } from './emissions_line'
import { MouseClickedEvent } from './mouse'

export type PlayedCard = {
  card: Card,
  position: number
}

export const playedCards = (
  mouseClickedEvents: MouseClickedEvent[],
  selected: Card[],
  spaceCards: SpaceCards
): PlayedCard[] => {
  let playedCards: PlayedCard[] = []
  for (const { x, y } of mouseClickedEvents) {
    for (const selectedCard of selected) {
      spaceCards.forEach((spaceCard, index) => {
        const focused = new Set(focusedSpaceCards(spaceCards, x, y))
        if (focused.has(spaceCard)) {
          playedCards.push({
            card: selectedCard,
            position: index
          })
        }
      })
    }
  }
  return playedCards
}
