import { Card } from './card'

export type Move = {
  readonly card: Card
  readonly field: "x" | "y" | "rotation" | "scale"
  readonly to: number
  readonly timestamp: number
}
