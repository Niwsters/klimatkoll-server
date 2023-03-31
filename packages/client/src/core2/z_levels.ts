import { Card } from './card'
import { SpaceCards, zLevels as emissionsLineZLevels } from './emissions_line'

export type ZLevel = {
  card: Card,
  zLevel: number
}

// + 10 to prevent first card going under emissions line card when zooming out
export const handZLevel = (index: number): number => index + 10

export const zLevels = (hand: Card[], emissionsLine: Card[], spaceCards: SpaceCards): ZLevel[] =>
  [
    ...hand.map((card, index) => ({
      card,
      zLevel: handZLevel(index)
    })),
    ...emissionsLineZLevels(emissionsLine, spaceCards)
  ]
