import { CardDesign } from "./card_design"
import { Card } from "./card"
import { PlayedCard } from './play_card'
import { dict } from "./util"

type State = {
  designs: CardDesign[]
  hand: Card[]
  emissionsLine: Card[]
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

export const init = (designs: CardDesign[]): State => {
  let deck = designs.map(d => d.card)
  let hand: Card[] = deck.slice(0, 1)
  let emissionsLine: Card[] = deck.slice(1, 2)
  deck = deck.slice(2)
  return {
    designs,
    hand,
    emissionsLine
  }
}

export const onCardsPlayed = (state: State, playedCards: PlayedCard[]): State => {
  state = { ...state }

  playedCards.forEach(playedCard => {
    const { card, position } = playedCard

    state.hand = state.hand.filter(card => card !== playedCard.card)
    if (isLegalPlay(state.emissionsLine, state.designs, playedCard)) {
      const left = state.emissionsLine.slice(0, position)
      const right = state.emissionsLine.slice(position)
      state.emissionsLine = [
        ...left,
        card,
        ...right
      ]
    }
  })

  return state
}
