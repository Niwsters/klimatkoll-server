import { Card } from './card'

const ANIMATION_DURATION_MS = 300

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

export const initMoves = (cards: Card[]): Moves => {
  let moves: Moves = {}
  for (const card of cards) {
    moves[card] = {
      x: { from: 0, to: 0, started: Date.now() },
      y: { from: 0, to: 0, started: Date.now() },
      rotation: { from: 0, to: 0, started: Date.now() },
      scale: { from: 1.0, to: 1.0, started: Date.now() }
    }
  }
  return moves
}

export function transpose(move: Move, currentTime: number): number {
  const { from, to, started } = move
  const timePassed = currentTime - started

  if (timePassed > ANIMATION_DURATION_MS) return to

  const fraction = timePassed/ANIMATION_DURATION_MS
  const mult = 1 - (1 - fraction) ** 2 // easeOutQuad easing function
  return from + (to - from)*mult
}
