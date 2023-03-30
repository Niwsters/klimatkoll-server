import { WIDTH, HEIGHT } from '../core/constants'
import { Card } from '../core2/card'
import { CARD_HEIGHT, CARD_WIDTH } from './constants'
import { Movements, PositionGoal, PositionGoals } from './move'

const HAND_POSITION_X = WIDTH / 2
const HAND_POSITION_Y = HEIGHT + 50
const HAND_CARD_ANGLE = Math.PI/5
const HAND_X_RADIUS = 160
const HAND_Y_RADIUS = 80
const HAND_ANGLE_FACTOR = HAND_Y_RADIUS / HAND_X_RADIUS // The angle should not map to the same ellipse as the position
const CARD_SCALE = 0.5

const cardAngle = (i: number, cardCount: number) => {
  const n = cardCount - 1
  return HAND_CARD_ANGLE * (i - n/2) * HAND_ANGLE_FACTOR
}

const cardX = (i: number, cardCount: number): number => {
  const angle = cardAngle(i, cardCount)
  return HAND_POSITION_X + HAND_X_RADIUS * Math.sin(angle)
}

const cardY = (i: number, cardCount: number): number => {
  const angle = cardAngle(i, cardCount)
  return HAND_POSITION_Y - HAND_Y_RADIUS * Math.cos(angle)
}

// + 10 to prevent first card going under emissions line card when zooming out
export const zLevel = (index: number): number => index + 10

function handWidth(cardCount: number): number {
  const leftIndex = 0
  const rightIndex = cardCount - 1
  const leftCardX = cardX(leftIndex, cardCount)
  const rightCardX = cardX(rightIndex, cardCount)
  return rightCardX - leftCardX + CARD_WIDTH
}

const distance = (a: number, b: number): number => Math.abs(a - b)

const closestCardToMouse = (cardCount: number, mouseX: number): number => {
  let closestCardX = 99999999
  let closestCardIndex = -1

  for (let index=0; index<cardCount; index++) {
    const x = cardX(index, cardCount)

    if (distance(mouseX, x) < distance(mouseX, closestCardX)) {
      closestCardIndex = index
      closestCardX = x
    }
  }

  return closestCardIndex
}

export const selectCard = (hand: Card[], mouseX: number, mouseY: number): Card[] => {
  return hand.slice(0, 1)
}

const HOVER_Y_AXIS_LIMIT: number =
  HAND_POSITION_Y - HAND_Y_RADIUS - CARD_HEIGHT / 2 * CARD_SCALE
function isCardFocused(
  cardCount: number,
  mouseX: number,
  mouseY: number,
  cardIndex: number
): boolean {
  const width = handWidth(cardCount)
  const closestCardIndex = closestCardToMouse(cardCount, mouseX)
  return closestCardIndex !== -1 &&
         cardIndex === closestCardIndex &&
         mouseY > HOVER_Y_AXIS_LIMIT &&
         mouseX > HAND_POSITION_X - width / 2 &&
         mouseX < HAND_POSITION_X + width / 2
}

function zoomInOnCard(goal: PositionGoal): PositionGoal {
  const scale = 1
  const y = HEIGHT - CARD_HEIGHT / 2 * scale
  const rotation = 0
  return {
    ...goal,
    scale,
    y,
    rotation
  }
}

const handGoal = (cardCount: number, mouseX: number, mouseY: number, index: number): PositionGoal => {
  const defaultGoal = {
    x: cardX(index, cardCount),
    y: cardY(index, cardCount),
    rotation: cardAngle(index, cardCount),
    scale: CARD_SCALE
  }

  if (isCardFocused(cardCount, mouseX, mouseY, index)) {
    return zoomInOnCard(defaultGoal)
  }

  return defaultGoal
}

export const handGoals = (
  moves: Movements,
  hand: Card[],
  mouseX: number,
  mouseY: number
): PositionGoals => {
  const goals: PositionGoals = {}
  hand.forEach((card, index) => {
    const move = moves[card]
    if (move !== undefined) {
      goals[card] = handGoal(hand.length, mouseX, mouseY, index)
    }
    return goals
  })
  return goals
}
