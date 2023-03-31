import { Card } from './card'
import { Position } from './position'
import { Positions } from './move'
import { WIDTH, HEIGHT, CARD_WIDTH, CARD_HEIGHT } from './constants'
import { ZLevel } from './z_levels'
import { closestCard } from './closest_card'

const EMISSIONS_LINE_MAX_LENGTH = WIDTH
const EMISSIONS_LINE_POSITION_X = WIDTH / 2
const EMISSIONS_LINE_POSITION_Y = HEIGHT / 2
const CARD_SCALE = 0.5

function cardDistance(cardCount: number): number {
  const cardWidth = CARD_WIDTH * CARD_SCALE
  const totalELWidth = cardWidth * cardCount
  let cardDistance = cardWidth
  if (totalELWidth > EMISSIONS_LINE_MAX_LENGTH) {
    cardDistance = (EMISSIONS_LINE_MAX_LENGTH - cardWidth) / (cardCount-1)
  }
  return cardDistance
}

const cardX = (index: number, cardCount: number): number => {
  const width = cardDistance(cardCount)
  const startOffset = 0 - width/2 * (cardCount - 1)
  const result = EMISSIONS_LINE_POSITION_X + startOffset + width * index
  return result
}

const cardY = () => {
  return EMISSIONS_LINE_POSITION_Y
}

const position = (card: Card, index: number, cardCount: number): Position => ({
  card,
  x: cardX(index, cardCount),
  y: cardY(),
  rotation: 0,
  scale: CARD_SCALE
})

export const emissionsLinePositions = (emissionsLine: Card[]): Positions => {
  const positions: Positions = {}
  emissionsLine.forEach((card, index) => {
    positions[card] = position(card, index, emissionsLine.length)
  })
  return positions
}

export type SpaceCards = Card[]

const spaceCard = (index: number): Card => "space-" + index

export const getSpaceCards = (emissionsLine: Card[]) => {
  return [
    ...emissionsLine.map((_, index) => spaceCard(index)),
    spaceCard(emissionsLine.length)
  ]
}

export const spaceCardsPositions = (spaceCards: SpaceCards): Positions => {
  return emissionsLinePositions(spaceCards)
}

export const zLevels = (emissionsLine: Card[], spaceCards: SpaceCards): ZLevel[] =>
  [
    ...spaceCards.map((card, index) => ({ card, zLevel: index-1 })),
    ...emissionsLine.map((card, index) => ({ card, zLevel: index }))
  ]

const width = (positions: Position[]): number => {
  let leftCardX = 0
  let rightCardX = 0
  for (const position of positions) {
    const x = position.x
    if (leftCardX === 0)
      leftCardX = x

    if (rightCardX === 0)
      rightCardX = x

    if (x < leftCardX)
      leftCardX = x

    if (x > rightCardX)
      rightCardX = x
  }

  const cardWidth = CARD_WIDTH * CARD_SCALE
  const x1 = leftCardX - cardWidth / 2
  const x2 = rightCardX + cardWidth / 2

  return x2 - x1 
}

const mouseWithinBounds = (width: number, mouseX: number, mouseY: number): boolean => {
  const lowerBoundsY = EMISSIONS_LINE_POSITION_Y - CARD_HEIGHT * CARD_SCALE / 2
  const upperBoundsY = EMISSIONS_LINE_POSITION_Y + CARD_HEIGHT * CARD_SCALE / 2

  const lowerBoundsX = EMISSIONS_LINE_POSITION_X - width / 2
  const upperBoundsX = EMISSIONS_LINE_POSITION_X + width / 2

  return mouseX > lowerBoundsX &&
         mouseX < upperBoundsX &&
         mouseY > lowerBoundsY &&
         mouseY < upperBoundsY
}

export const focusedSpaceCards = (
  spaceCards: SpaceCards,
  mouseX: number,
  mouseY: number
): Card[] => {
  const positions = Object.values(spaceCardsPositions(spaceCards))

  if (mouseWithinBounds(width(positions), mouseX, mouseY)) {
    return closestCard(positions, mouseX, mouseY)
  }

  return []
}
