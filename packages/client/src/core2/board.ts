import * as Animation from './animation'
import * as Canvas from '../components/Canvas'
import { WIDTH, HEIGHT } from '../core/constants'

export const HAND_POSITION_X = WIDTH / 2
export const HAND_POSITION_Y = HEIGHT + 50
export const HAND_CARD_ANGLE = Math.PI/5
export const HAND_X_RADIUS = 160
export const HAND_Y_RADIUS = 80
export const HAND_ANGLE_FACTOR = HAND_Y_RADIUS / HAND_X_RADIUS // The angle should not map to the same ellipse as the position

function getCardAngle(i: number, cardCount: number) {
  const n = cardCount - 1
  return HAND_CARD_ANGLE * (i - n/2)
}

function getCardPosition(i: number, cardCount: number) {
  const angle = getCardAngle(i, cardCount)
  const x = HAND_POSITION_X + HAND_X_RADIUS * Math.sin(angle)
  const y = HAND_POSITION_Y - HAND_Y_RADIUS * Math.cos(angle)
  return [x, y]
}

function getCardRotation(i: number, cardCount: number) {
  let angle = getCardAngle(i, cardCount)
  return angle * HAND_ANGLE_FACTOR
}

function moveCardDefault(
  card: Animation.AnimatedCard,
  cardIndex: number,
  cardCount: number,
  currentTime: number
): Animation.AnimatedCard {
  const [x, y] = getCardPosition(cardIndex, cardCount)
  const scale = 1.0
  const rotation = getCardRotation(cardIndex, cardCount)
  card = Animation.move_x(card, x, currentTime)
  card = Animation.move_y(card, y, currentTime)
  card = Animation.rotate(card, rotation, currentTime)

  // + 10 to prevent first card going under emissions line card when zooming out
  // card.zLevel = cardIndex + 10
  return Animation.scale(card, scale, currentTime)
}

export type Board = {
  hand: Animation.AnimatedCard[]
}

export function create(): Board {
  return { hand: [] }
}

export function cards(board: Board): Canvas.Card[] {
  const currentTime = Date.now()

  return board.hand.map(card => Animation.animate(card, currentTime))
}

export function add_hand_card(board: Board, card: Animation.AnimatedCard): Board {
  card = Animation.move_x(card, HAND_POSITION_X, Date.now())
  card = Animation.move_y(card, HAND_POSITION_Y, Date.now())

  return {
    ...board,
    hand: [...board.hand, card]
  }
}

function hand(board: Board, currentTime: number): Animation.AnimatedCard[] {
  return board.hand
    .map((card, i) => moveCardDefault(card, i, board.hand.length, currentTime))
}

export function update(board: Board): Board {
  return {
    ...board,
    hand: hand(board, Date.now())
  }
}
