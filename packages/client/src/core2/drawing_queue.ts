import { CardDesign } from './card_design'
import { Card, CardPosition, Reflection, ZLevel } from './card'
import { CardToDraw } from './draw_card'

export const createDrawingQueue = (
  positions: CardPosition[],
  designs: CardDesign[],
  visible: Card[],
  flipped: Card[],
  selected: Card[],
  spaceCards: Card[],
  reflections: Reflection[],
  zLevels: ZLevel[]
): CardToDraw[] => {
  let designDict = {}
  for (const design of designs) {
    designDict[design.card] = design
  }

  const flippedSet = new Set(flipped)
  const visibleSet = new Set(visible)
  const selectedSet = new Set(selected)
  const spaceCardsSet = new Set(spaceCards)
  let opacity = 1.0

  for (const reflection of reflections) {
    const reflectedDesign = designDict[reflection.reflected]
    if (reflectedDesign !== undefined) {
      designDict[reflection.card] = reflectedDesign
      spaceCardsSet.delete(reflection.card)
      opacity = 0.7
    }
  }

  const zLevelsDict = {}
  for (const zLevel of zLevels) {
    zLevelsDict[zLevel.card] = zLevel.zLevel
  }
  const zLevel = (card: Card) => zLevelsDict[card] || 0
  positions = positions.sort((a,b) => zLevel(a.card) - zLevel(b.card))

  const cardsToDraw: CardToDraw[] = []
  for (const position of positions) {
    const card = position.card
    if (visibleSet.has(card)) {
      const design = designDict[card]
      if (design !== undefined) {
          const flipped = flippedSet.has(card)
          const selected = selectedSet.has(card)
          const isSpace = spaceCardsSet.has(card)
          const cardToDraw: CardToDraw = 
            { position, design, isSpace, flipped, selected, opacity }
          cardsToDraw.push(cardToDraw)
      }
    }
  }
  return cardsToDraw
}
