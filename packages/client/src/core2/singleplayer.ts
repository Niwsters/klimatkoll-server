import { CardDesign } from "./card_design"
import { Card } from "./card"
import { PlayedCard } from './play_card'
import { dict } from "./util"

type State = {
  designs: CardDesign[]
  hand: Card[]
  emissionsLine: Card[]
}

const addFiller = (emissionsLine: Card[]): Card[] => {
  let filled: Card[] = ["filler"]
  for (const card of emissionsLine) {
    filled.push(card)
    filled.push("filler")
  }
  return filled
}

/*
  const isCorrectPlacement = (board: Board.Board, cardName: string, position: number) => {
    const card = cardEmissions.find(c => c.name === cardName)
    if (card === undefined) return

    const cards = equijoin(board.emissionsLine.cards, cardEmissions, a => a.name, b => b.name)
      .sort((a,b) => a.emissions - b.emissions)

    const leftCard = cards[position]
    const rightCard = cards[position+1]

    return (leftCard === undefined || leftCard.emissions <= card.emissions) &&
           (rightCard === undefined || card.emissions <= rightCard.emissions)
  }
  */

const isLegalPlay = (emissionsLine: Card[], designs: CardDesign[], playedCard: PlayedCard): boolean => {
  const designsDict = dict(designs, d => d.card)
  const { card, position } = playedCard

  const filled = addFiller(emissionsLine)

  const leftOf = filled[position*2-1]
  const rightOf = filled[position*2+1]

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
    if (isLegalPlay(state.emissionsLine, state.designs, playedCard)) {
      state.hand = state.hand.filter(card => card !== playedCard.card)

      const filled = addFiller(state.emissionsLine)

      filled[playedCard.position*2] = playedCard.card
      state.emissionsLine = filled.filter(card => card !== "filler")
    }
  })

  return state
}
