import { Card } from './card'
import { ZLevel } from './z_levels'
import { CardToDraw } from './draw_card'
import { dict } from './util'
import { Position } from './position'

export const createDrawingQueue = (
  positions: Position[],
  visible: Card[],
  flipped: Card[],
  selected: Card[],
  spaceCards: Card[],
  zLevels: ZLevel[]
): CardToDraw[] => {
  const flippedSet = new Set(flipped)
  const visibleSet = new Set(visible)
  const selectedSet = new Set(selected)
  const spaceCardsSet = new Set(spaceCards)

  const opacities: {[card: Card]: number} = {}
  const opacity = (card: Card): number => {
    const opacity = opacities[card]
    if (opacity === undefined) {
      return 1.0
    }
    return opacity
  }

  const zLevelsDict = dict(zLevels, z => z.card)
  const zLevel = (card: Card): number => {
    const zLevel = zLevelsDict[card]
    if (zLevel !== undefined) {
      return zLevel.zLevel
    }
    return 0
  }
  positions = positions.sort((a,b) => zLevel(a.card) - zLevel(b.card))

  const cardsToDraw: CardToDraw[] = []
  for (const position of positions) {
    const card = position.card
    if (visibleSet.has(card)) {
        const flipped = flippedSet.has(card)
        const selected = selectedSet.has(card)
        const isSpace = spaceCardsSet.has(card)
        const cardToDraw: CardToDraw = 
          { card, position, isSpace, flipped, selected, opacity: opacity(card) }
        cardsToDraw.push(cardToDraw)
    }
  }
  return cardsToDraw
}
