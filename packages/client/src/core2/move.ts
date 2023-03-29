import { Card } from './card'

export type Move = {
  readonly from: number
  readonly to: number
  readonly started: number
}

export type Moves = {
  [card: Card]: {
    x: Move,
    y: Move,
    rotation: Move,
    scale: Move
  }
}
