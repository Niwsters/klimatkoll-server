import * as Animation from './animation'
import * as Canvas from '../components/Canvas'
import * as Hand from './hand'
import * as EmissionsLine from './emissions_line'

export type Board = {
  readonly hand: Hand.Hand,
  readonly emissionsLine: EmissionsLine.EmissionsLine
}

export function create(): Board {
  return {
    hand: Hand.create(),
    emissionsLine: EmissionsLine.create()
  }
}

export function animate(
  board: Board,
  currentTime: number
): Canvas.Card[] {
  return [
    ...board.hand.cards,
    ...board.emissionsLine.cards
  ].map(card => Animation.animate(card, currentTime))
}

export function add_hand_card(
  board: Board,
  card: Animation.AnimatedCard,
  currentTime: number
): Board {
  return {
    ...board,
    hand: Hand.add_card(board.hand, card, currentTime)
  }
}

export function add_el_card(
  board: Board,
  card: Animation.AnimatedCard,
  currentTime: number
): Board {
  return {
    ...board,
    emissionsLine: EmissionsLine.add_card(board.emissionsLine, card, currentTime)
  }
}

export function update(
  board: Board,
  currentTime: number,
  mouseX: number,
  mouseY: number
): Board {
  return {
    ...board,
    hand: Hand.update(board.hand, currentTime, mouseX, mouseY)
  }
}

export function mouse_clicked(
  board: Board,
  mouseX: number,
  mouseY: number,
  currentTime: number
): Board {
  board = {
    ...board,
    hand: Hand.mouse_clicked(board.hand, mouseX, mouseY, currentTime)
  }
  const selectedCard = Hand.selected_card(board.hand)
  board = {
    ...board,
    emissionsLine: EmissionsLine.card_selected(board.emissionsLine, selectedCard)
  }
  return board
}
