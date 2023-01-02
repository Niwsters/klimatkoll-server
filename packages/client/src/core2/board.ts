import * as Animation from './animation'
import * as Canvas from '../components/Canvas'
import * as Hand from './hand'

export type Board = {
  hand: Hand.Hand
}

export function create(): Board {
  return { hand: Hand.create() }
}

export function animate(board: Board, currentTime: number): Canvas.Card[] {
  return Hand.animate(board.hand, currentTime)
}

export function add_hand_card(board: Board, card: Animation.AnimatedCard): Board {
  return {
    ...board,
    hand: Hand.add_card(board.hand, card)
  }
}

export function update(board: Board, currentTime: number, mouseX: number, mouseY: number): Board {
  return {
    ...board,
    hand: Hand.update(board.hand, currentTime, mouseX, mouseY)
  }
}

export function mouse_clicked(board: Board, mouseX: number, mouseY: number, currentTime: number): Board {
  return {
    ...board,
    hand: Hand.mouse_clicked(board.hand, mouseX, mouseY, currentTime)
  }
}
