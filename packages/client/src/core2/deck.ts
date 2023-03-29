import { Card, move_x, move_y, scale, update as updateCard } from './card'

const DECK_POSITION_X = 800
const DECK_POSITION_Y = 100
const CARD_SCALE = 0.5

export type Deck = {
  cards: Card[]
}

export function create(cards: Card[]): Deck {
  return { cards }
}

export function draw(deck: Deck): [Deck, Card] {
  const card = {...deck.cards[0]}
  deck = { ...deck, cards: deck.cards.slice(1) }
  return [deck, card]
}

const shuffleArray = (list: any[]) => {
  list = list.slice()
  const random = () => Math.random()

  for (let i = list.length - 1; i > 0; i--) {
    var j = Math.floor(random() * (i + 1));
    var temp = list[i];
    list[i] = list[j];
    list[j] = temp;
  }

  return list
}

export const shuffle = (deck: Deck): Deck => ({
  ...deck,
  cards: shuffleArray(deck.cards)
})

export const update = (deck: Deck, currentTime: number): Deck => ({
  ...deck,
  cards: deck.cards
    .map(card => scale(card, CARD_SCALE, currentTime))
    .map(card => move_x(card, DECK_POSITION_X, currentTime))
    .map(card => move_y(card, DECK_POSITION_Y, currentTime))
    .map(card => updateCard(card, currentTime))
})

export const cards = (deck: Deck): Card[] => deck.cards.slice(0, 1)
