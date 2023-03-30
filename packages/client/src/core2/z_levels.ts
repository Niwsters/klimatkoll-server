import { Card } from './card'

export type ZLevel = {
  card: Card,
  zLevel: number
}

// + 10 to prevent first card going under emissions line card when zooming out
export const handZLevel = (index: number): number => index + 10

export const zLevels = (hand: Card[]): ZLevel[] =>
  hand.map((card, index) => ({
    card,
    zLevel: handZLevel(index)
  }))
