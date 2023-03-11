import * as Hand from './hand'
import * as EmissionsLine from './emissions_line'
import * as Card from './card'
import * as Deck from './deck'
import * as DiscardPile from './discard_pile'
import { EventToAdd } from '@shared/events'

export type Board = {
  readonly hand: Hand.Hand,
  readonly emissionsLine: EmissionsLine.EmissionsLine,
  readonly deck: Deck.Deck,
  readonly discardPile: DiscardPile.DiscardPile
}

export function create(deck: Card.Card[]): Board {
  return {
    hand: Hand.create(),
    emissionsLine: EmissionsLine.create(),
    deck: Deck.create(deck),
    discardPile: DiscardPile.create()
  }
}

export function cards(
  board: Board
): Card.Card[] {
  return [
    ...board.hand.cards,
    ...board.emissionsLine.cards,
    ...board.discardPile.cards
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
    emissionsLine: EmissionsLine.update(board.emissionsLine, mouseX, mouseY, currentTime),
    discardPile: DiscardPile.update(board.discardPile, currentTime)
  }
}

export type CardPlayRequestedEvent = EventToAdd & {
  event_type: "card_play_requested",
  payload: { cardID: string }
}

function cardPlayRequestEvent(timestamp: number, card: Card.Card): CardPlayRequestedEvent {
  return {
    event_type: "card_play_requested",
    payload: { cardID: card.id },
    timestamp
  }
}

function selectDeselectHandCard(board: Board, mouseX: number, mouseY: number): Board {
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

export function mouseClicked(
  board: Board,
  mouseX: number,
  mouseY: number
): [Board, EventToAdd[]] {
  const { hand, emissionsLine } = board

  const focusedELCard = EmissionsLine.focusedCard(emissionsLine, mouseX, mouseY)
  const selectedHandCard = Hand.selectedCard(hand)

  let events: EventToAdd[] = []
  if (selectedHandCard !== null && focusedELCard !== undefined)
    events = [...events, cardPlayRequestEvent(Date.now(), selectedHandCard)]

  return [selectDeselectHandCard(board, mouseX, mouseY), events]
}

export function discardCard(
  board: Board,
  card: Card.Card,
  currentTime: number
): Board {
  return {
    ...board,
    hand: Hand.removeCard(board.hand, card),
    discardPile: DiscardPile.addCard(card, currentTime)
  }
}
