import { Card } from './card'
import { Position } from './position'
import { Positions } from './move'
import { WIDTH, HEIGHT, CARD_WIDTH, CARD_HEIGHT } from './constants'
import { entries } from './util'
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
  const startOffset = 0 - width/2
  const result = EMISSIONS_LINE_POSITION_X + startOffset + width * index
  return result
}

const cardY = () => {
  return EMISSIONS_LINE_POSITION_Y
}

const goal = (card: Card, index: number, cardCount: number): Position => ({
  card,
  x: cardX(index, cardCount),
  y: cardY(),
  rotation: 0,
  scale: CARD_SCALE
})

export const emissionsLineGoals = (emissionsLine: Card[]): Positions => {
  const goals: Positions = {}
  emissionsLine.forEach((card, index) => {
    goals[card] = goal(card, index, emissionsLine.length)
  })
  return goals
}

export type SpaceCards = Card[]

const spaceCard = (index: number): Card => "space-" + index

export const getSpaceCards = (el: Card[]) => {
  let spaceCards: Card[] = [spaceCard(0)]
  el.forEach((_, index) => {
    spaceCards.push(spaceCard(index+1))
  })
  for (const _ of el) {
  }
  return spaceCards
}

export const spaceCardsGoals = (spaceCards: SpaceCards): Positions => {
  const goals = emissionsLineGoals(spaceCards)
  const newGoals = {...goals}
  for (const [card, goal] of entries(goals)) {
    const newGoal = {
      ...goal,
      x: goal.x - CARD_WIDTH / 4
    }
    newGoals[card] = newGoal
  }
  return newGoals
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

export const focusedCards = (
  cards: Card[],
  positions: Position[],
  mouseX: number,
  mouseY: number
): Card[] => {
  const cardsSet = new Set(cards)
  positions = positions.filter(p => cardsSet.has(p.card))

  if (mouseWithinBounds(width(positions), mouseX, mouseY)) {
    return closestCard(positions, mouseX, mouseY)
  }

  return []
}
