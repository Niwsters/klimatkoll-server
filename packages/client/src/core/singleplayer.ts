import { CardDesign } from "./card_design"
import { Card } from "./card"
import { PlayedCard } from './play_card'
import { dict, shuffle } from "./util"
import { Piles } from "./pile"

export const init = (designs: CardDesign[]): Piles => {
  let deck = shuffle(designs.map(d => d.card))
  let hand: Card[] = deck.slice(0, 1)
  let emissionsLine: Card[] = deck.slice(1, 2)
  const discardPile: Card[] = []
  deck = deck.slice(2)
  return {
    deck,
    hand,
    emissionsLine,
    discardPile
  }
}

const isLegalPlay = (
  emissionsLine: Card[],
  designs: CardDesign[],
  playedCard: PlayedCard
): boolean => {
  const designsDict = dict(designs, d => d.card)
  const { card, position } = playedCard

  const leftOf = emissionsLine[position-1]
  const rightOf = emissionsLine[position]

  const emissions = designsDict[card]?.emissions || 0

  if (emissions === undefined)
    return false

  const left = leftOf !== undefined ? designsDict[leftOf]?.emissions : undefined
  const right = rightOf !== undefined ? designsDict[rightOf]?.emissions : undefined
  
  const leftOk = left === undefined || left <= emissions
  const rightOk = right === undefined || emissions <= right

  return leftOk && rightOk
}

export const playCards = (
  piles: Piles,
  designs: CardDesign[],
  playedCards: PlayedCard[]
): Piles => {
  let { hand, emissionsLine, discardPile, deck } = piles

  playedCards.forEach(playedCard => {
    const { card, position } = playedCard

    hand = hand.filter(card => card !== playedCard.card)
    const drawnCard = deck.slice(deck.length - 1)
    hand = [...hand, ...drawnCard]
    deck = deck.slice(0, deck.length - 1)

    if (isLegalPlay(emissionsLine, designs, playedCard)) {
      const left = emissionsLine.slice(0, position)
      const right = emissionsLine.slice(position)
      emissionsLine = [
        ...left,
        card,
        ...right
      ]
    } else {
      discardPile = [...discardPile, card]
    }
  })

  return {
    ...piles,
    deck,
    hand,
    emissionsLine,
    discardPile
  }
}

export const score = (piles: Piles) => piles.emissionsLine.length - 1
