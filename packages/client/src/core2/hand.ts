import { WIDTH, HEIGHT } from '../core/constants'
import { Card } from '../core2/card'
import { closestCard } from './closest_card'
import { CARD_HEIGHT, CARD_WIDTH } from './constants'
import { Position } from './position'
import { Positions } from './move'

const HAND_POSITION_X = WIDTH / 2
const HAND_POSITION_Y = HEIGHT + 50
const HAND_CARD_ANGLE = Math.PI/5
const HAND_X_RADIUS = 160
const HAND_Y_RADIUS = 80
const HAND_ANGLE_FACTOR = HAND_Y_RADIUS / HAND_X_RADIUS // The angle should not map to the same ellipse as the position
const CARD_SCALE = 0.5
const HOVER_Y_AXIS_LIMIT: number =
  HAND_POSITION_Y - HAND_Y_RADIUS - CARD_HEIGHT / 2 * CARD_SCALE

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

const handWidth = (cardCount: number): number => {
  const leftIndex = 0
  const rightIndex = cardCount - 1
  const leftCardX = cardX(leftIndex, cardCount)
  const rightCardX = cardX(rightIndex, cardCount)
  return rightCardX - leftCardX + CARD_WIDTH
}

const mouseWithinBounds = (cardCount: number, mouseX: number, mouseY: number): boolean => {
  const width = handWidth(cardCount)
  return mouseY > HOVER_Y_AXIS_LIMIT &&
         mouseX > HAND_POSITION_X - width / 2 &&
         mouseX < HAND_POSITION_X + width / 2
}

const zoomInOnCard = (position: Position): Position => {
  const scale = 1
  const y = HEIGHT - CARD_HEIGHT / 2 * scale
  const rotation = 0
  return {
    ...position,
    scale,
    y,
    rotation
  }
}

const defaultPositions = (
  hand: Card[]
): Positions => {
  const positions: Positions = {}
  hand.forEach((card, index) => {
    positions[card] = {
      card,
      x: cardX(index, hand.length),
      y: cardY(index, hand.length),
      rotation: cardAngle(index, hand.length),
      scale: CARD_SCALE
    }
  })
  return positions
}

export const focusedCards = (hand: Card[], mouseX: number, mouseY: number): Card[] => {
  const positions = Object.values(defaultPositions(hand))
  if (mouseWithinBounds(positions.length, mouseX, mouseY)) {
    return closestCard(positions, mouseX, mouseY)
  }
  return []
}

export const handPositions = (
  hand: Card[],
  mouseX: number,
  mouseY: number
): Positions => {
  const positions = defaultPositions(hand)
  focusedCards(hand, mouseX, mouseY).forEach(card => {
    const position = positions[card]
    if (position !== undefined) {
      positions[card] = zoomInOnCard(position)
    }
  })

  return positions
}
