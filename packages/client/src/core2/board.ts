import * as Hand from './hand'
import * as EmissionsLine from './emissions_line'
import * as Card from './card'
import * as Deck from './deck'

export type Board = {
  readonly hand: Hand.Hand,
  readonly emissionsLine: EmissionsLine.EmissionsLine,
  readonly deck: Deck.Deck
}

export function create(deck: Card.Card[]): Board {
  return {
    hand: Hand.create(),
    emissionsLine: EmissionsLine.create(),
    deck: Deck.create(deck)
  }
}

export function cards(
  board: Board
): Card.Card[] {
  return [
    ...board.hand.cards,
    ...board.emissionsLine.cards
  ]
}

export function add_hand_card(
  board: Board,
  card: Card.Card,
  currentTime: number
): Board {
  return {
    ...board,
    hand: Hand.add_card(board.hand, card, currentTime)
  }
}

export function add_el_card(
  board: Board,
  card: Card.Card,
  currentTime: number
): Board {
  return {
    ...board,
    emissionsLine: EmissionsLine.add_card(board.emissionsLine, card, currentTime)
  }
}

export function drawHandCard(board: Board, currentTime: number) {
  const [deck, card] = Deck.draw(board.deck)

  return {
    ...board,
    deck,
    hand: Hand.add_card(board.hand, card, currentTime)
  }
}

export function playCardFromDeck(board: Board, currentTime: number) {
  const [deck, card] = Deck.draw(board.deck)

  return {
    ...board,
    deck,
    emissionsLine: EmissionsLine.add_card(board.emissionsLine, card, currentTime)
  }
}

export function update(
  board: Board,
  mouseX: number,
  mouseY: number,
  currentTime: number
): Board {
  return {
    ...board,
    hand: Hand.update(board.hand, mouseX, mouseY, currentTime),
    emissionsLine: EmissionsLine.update(board.emissionsLine, mouseX, mouseY, currentTime)
  }
}

export function mouse_clicked(
  board: Board,
  mouseX: number,
  mouseY: number
): Board {
  board = {
    ...board,
    hand: Hand.mouse_clicked(board.hand, mouseX, mouseY)
  }
  const selectedCard = Hand.selected_card(board.hand)
  board = {
    ...board,
    emissionsLine: EmissionsLine.card_selected(board.emissionsLine, selectedCard)
  }
  return board
}
