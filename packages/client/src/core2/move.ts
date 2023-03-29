import { Card } from './card'
import { emissionsLineGoals } from './emissions_line'
import { handGoals } from './hand'

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

export type PositionGoal = {
  x: number,
  y: number,
  rotation: number,
  scale: number
}

export type PositionGoals = {
  [card: Card]: PositionGoal
}

const applyGoals = (moves: Moves, goals: PositionGoals, currentTime: number): Moves => {
  let newMoves = {...moves}

  for (const [card, goal] of Object.entries(goals)) {
    for (const [field, value] of Object.entries(goal)) {
      const move = moves[card]
      const fieldMove: Move = move[field]
      if (move[field].to !== value) {
        const from = transpose(fieldMove, currentTime)
        newMoves[card][field] = { from, to: value, started: currentTime }
      }
    }
  }

  return newMoves
}

export const getMoves = (
  moves: Moves,
  hand: Card[],
  emissionsLine: Card[],
  currentTime: number
): Moves => {
  const goals = {
    ...handGoals(moves, hand),
    ...emissionsLineGoals(moves, emissionsLine)
  }
  moves = applyGoals(moves, goals, currentTime)
  return moves
}
