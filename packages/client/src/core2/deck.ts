import * as Card from './card'

export type Deck = {
  cards: Card.Card[]
}

export function create(cards: Card.Card[]): Deck {
  return { cards }
}

export function draw(deck: Deck): [Deck, Card.Card] {
  const card = {...deck.cards[0]}
  deck = { ...deck, cards: deck.cards.slice(1) }
  return [deck, card]
}
