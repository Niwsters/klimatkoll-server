import { Card } from './card'
import { Position } from './position'
import { emissionsLinePositions, spaceCardsPositions } from './emissions_line'
import { handPositions } from './hand'
import { entries } from './util'
import { discardPilePositions } from './discard_pile'
import { Piles } from './pile'
import { deckPositions } from './deck'

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

export type Positions = {
  [card: Card]: Position
}

const applyPosition = (move: Movement, position: Position, currentTime: number): Movement => {
  const newMove = { ...move }
  for (const [field, value] of entries(position)) {
    if (field !== 'card') {
      const transition: Transition = move[field]
      if (transition.to !== value) {
        const from = transpose(transition, currentTime)
        newMove[field] = { from, to: value, started: currentTime }
      }
    }
  }
  return newMove
}

const applyPositions = (moves: Movements, positions: Positions, currentTime: number): Movements => {
  let newMovements: Movements = {...moves}
  for (const [card, position] of Object.entries(positions)) {
    const move = moves[card] || initMovement()
    newMovements[card] = applyPosition(move, position, currentTime)
  }
  return newMovements
}

export const getMovements = (
  moves: Movements,
  piles: Piles,
  spaceCards: Card[],
  mouseX: number,
  mouseY: number,
  currentTime: number
): Movements => {
  const positions = {
    ...handPositions(piles.hand, mouseX, mouseY),
    ...emissionsLinePositions(piles.emissionsLine),
    ...spaceCardsPositions(spaceCards),
    ...discardPilePositions(piles.discardPile),
    ...deckPositions(piles.deck)
  }
  moves = applyPositions(moves, positions, currentTime)
  return moves
}
