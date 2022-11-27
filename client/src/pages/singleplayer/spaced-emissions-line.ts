import { Card } from "core/card"

type CardSpace = null
const CARD_SPACE = null

type SpacedEmissionsLine = (Card | CardSpace)[]

export function spacedEmissionsLine(emissionsLine: Card[]): SpacedEmissionsLine {
  return emissionsLine.reduce((el: SpacedEmissionsLine, card: Card) => {
    return [...el, card, CARD_SPACE]
  }, [CARD_SPACE])
}

export function insertCardIntoEmissionsLine(
  emissionsLine: Card[],
  card: Card,
  position: number
): Card[] {
  const el = spacedEmissionsLine(emissionsLine)
  el[position] = card
  return el.filter(c => c !== CARD_SPACE) as Card[]
}
