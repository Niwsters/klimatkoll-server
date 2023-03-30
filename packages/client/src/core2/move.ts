import { Card } from './card'
import { emissionsLineGoals } from './emissions_line'
import { handGoals } from './hand'

const ANIMATION_DURATION_MS = 300

export type Movement = {
  readonly from: number
  readonly to: number
  readonly started: number
}

export type Movements = {
  [card: Card]: {
    x: Movement,
    y: Movement,
    rotation: Movement,
    scale: Movement
  }
}

export const initMovements = (cards: Card[]): Movements => {
  let moves: Movements = {}
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

export function transpose(move: Movement, currentTime: number): number {
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

const applyGoals = (moves: Movements, goals: PositionGoals, currentTime: number): Movements => {
  let newMovements = {...moves}

  for (const [card, goal] of Object.entries(goals)) {
    for (const [field, value] of Object.entries(goal)) {
      const move = moves[card]
      const fieldMovement: Movement = move[field]
      if (move[field].to !== value) {
        const from = transpose(fieldMovement, currentTime)
        newMovements[card][field] = { from, to: value, started: currentTime }
      }
    }
  }

  return newMovements
}

export const getMovements = (
  moves: Movements,
  hand: Card[],
  emissionsLine: Card[],
  mouseX: number,
  mouseY: number,
  currentTime: number
): Movements => {
  const goals = {
    ...handGoals(moves, hand, mouseX, mouseY),
    ...emissionsLineGoals(moves, emissionsLine)
  }
  moves = applyGoals(moves, goals, currentTime)
  return moves
}
