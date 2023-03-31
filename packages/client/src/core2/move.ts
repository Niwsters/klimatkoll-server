import { Card } from './card'
import { emissionsLineGoals, spaceCardsGoals } from './emissions_line'
import { handGoals } from './hand'

const ANIMATION_DURATION_MS = 300

export type Transition = {
  readonly from: number
  readonly to: number
  readonly started: number
}

export type Movement = {
  x: Transition,
  y: Transition,
  rotation: Transition,
  scale: Transition
}

export type Movements = {
  [card: Card]: Movement
}

export const initMovement = (): Movement => ({
  x: { from: 0, to: 0, started: Date.now() },
  y: { from: 0, to: 0, started: Date.now() },
  rotation: { from: 0, to: 0, started: Date.now() },
  scale: { from: 1.0, to: 1.0, started: Date.now() }
})

export const initMovements = (cards: Card[]): Movements => {
  let moves: Movements = {}
  for (const card of cards) {
    moves[card] = initMovement()
  }
  return moves
}

export function transpose(move: Transition, currentTime: number): number {
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

type Entries<T> = {
  [K in keyof T]: [K, T[K]]
}[keyof T][]
const entries = (goal: PositionGoal): Entries<PositionGoal> => {
  return Object.entries(goal) as any
}

const applyGoal = (move: Movement, goal: PositionGoal, currentTime: number): Movement => {
  const newMove = { ...move }
  for (const [field, value] of entries(goal)) {
    const transition: Transition = move[field]
    if (transition.to !== value) {
      const from = transpose(transition, currentTime)
      newMove[field] = { from, to: value, started: currentTime }
    }
  }
  return newMove
}

const applyGoals = (moves: Movements, goals: PositionGoals, currentTime: number): Movements => {
  let newMovements: Movements = {...moves}
  for (const [card, goal] of Object.entries(goals)) {
    const move = moves[card] || initMovement()
    newMovements[card] = applyGoal(move, goal, currentTime)
  }
  return newMovements
}

export const getMovements = (
  moves: Movements,
  hand: Card[],
  emissionsLine: Card[],
  spaceCards: Card[],
  mouseX: number,
  mouseY: number,
  currentTime: number
): Movements => {
  const goals = {
    ...handGoals(moves, hand, mouseX, mouseY),
    ...emissionsLineGoals(emissionsLine),
    ...spaceCardsGoals(spaceCards)
  }
  moves = applyGoals(moves, goals, currentTime)
  return moves
}