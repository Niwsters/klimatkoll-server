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

export function addHandCard(
  board: Board,
  card: Card.Card,
  currentTime: number
): Board {
  return {
    ...board,
    hand: Hand.addCard(board.hand, card, currentTime)
  }
}

export function addELCard(
  board: Board,
  card: Card.Card,
  currentTime: number
): Board {
  return {
    ...board,
    emissionsLine: EmissionsLine.addCard(board.emissionsLine, card, currentTime)
  }
}

export function drawHandCard(board: Board, currentTime: number) {
  const [deck, card] = Deck.draw(board.deck)

  return {
    ...board,
    deck,
    hand: Hand.addCard(board.hand, card, currentTime)
  }
}

export function playCardFromDeck(board: Board, currentTime: number) {
  const [deck, card] = Deck.draw(board.deck)

  return {
    ...board,
    deck,
    emissionsLine: EmissionsLine.addCard(board.emissionsLine, card, currentTime)
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

export function mouseClicked(
  board: Board,
  mouseX: number,
  mouseY: number
): Board {
  board = {
    ...board,
    hand: Hand.mouseClicked(board.hand, mouseX, mouseY)
  }
  const selectedCard = Hand.selectedCard(board.hand)
  board = {
    ...board,
    emissionsLine: EmissionsLine.cardSelected(board.emissionsLine, selectedCard)
  }
  return board
}
