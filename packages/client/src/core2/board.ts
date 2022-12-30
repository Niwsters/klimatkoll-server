import * as Animation from './animation'
import * as Canvas from '../components/Canvas'
import { WIDTH, HEIGHT } from '../core/constants'

export const HAND_POSITION_X = WIDTH / 2
export const HAND_POSITION_Y = HEIGHT + 50

export type Board = {
  hand: Animation.AnimatedCard[]
}

export function create(): Board {
  return { hand: [] }
}

export function cards(board: Board): Canvas.Card[] {
  return board.hand.map(card => Animation.animate(card, Date.now()))
}

export function add_hand_card(board: Board, card: Animation.AnimatedCard): Board {
  card = Animation.move_x(card, HAND_POSITION_X, Date.now())
  card = Animation.move_y(card, HAND_POSITION_Y, Date.now())

  return {
    ...board,
    hand: [...board.hand, card]
  }
}
