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
