export type CardPosition = {
  readonly card: string,
  readonly zLevel: number,
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

export const defaultCardPositioning = (card: Card): CardPosition => ({
  card,
  zLevel: 0,
  x: 0,
  y: 0,
  rotation: 0,
  scale: 1
})
