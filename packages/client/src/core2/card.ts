export type CardPosition = {
  readonly card: string,
  readonly x: number,
  readonly y: number,
  readonly rotation: number,
  readonly scale: number
}

export type Card = string

export type Reflection = {
  card: Card,
  reflected: Card
}

export type ZLevel = {
  card: Card,
  zLevel: number
}

export const defaultCardPositioning = (card: Card): CardPosition => ({
  card,
  x: 0,
  y: 0,
  rotation: 0,
  scale: 1
})
