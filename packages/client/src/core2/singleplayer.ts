import { CardDesign } from "./card_design"
import { Card } from "./card"
import { PlayedCard } from './play_card'

type State = {
  hand: Card[]
  emissionsLine: Card[]
}

export const init = (designs: CardDesign[]): State => {
  let deck = designs.map(d => d.card)
  let hand: Card[] = deck.slice(0, 1)
  let emissionsLine: Card[] = deck.slice(1, 2)
  deck = deck.slice(2)
  return {
    hand,
    emissionsLine
  }
}

export const onCardPlayed = (state: State, playedCard: PlayedCard): State => {
  state = { ...state }
  state.hand = state.hand.filter(card => card !== playedCard.card)

  let filled: Card[] = ["filler"]
  for (const card of state.emissionsLine) {
    filled.push(card)
    filled.push("filler")
  }

  filled[playedCard.position*2] = playedCard.card
  state.emissionsLine = filled.filter(card => card !== "filler")
  return state
}
