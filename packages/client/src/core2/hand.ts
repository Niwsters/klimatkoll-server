import { WIDTH, HEIGHT } from '../core/constants'
import { Card } from '../core2/card'
import { Move, Moves, transpose } from './move'

const HAND_POSITION_X = WIDTH / 2
const HAND_POSITION_Y = HEIGHT + 50
const HAND_CARD_ANGLE = Math.PI/5
const HAND_X_RADIUS = 160
const HAND_Y_RADIUS = 80
const HAND_ANGLE_FACTOR = HAND_Y_RADIUS / HAND_X_RADIUS // The angle should not map to the same ellipse as the position
const CARD_SCALE = 0.5

const cardAngle = (i: number, cardCount: number) => {
  const n = cardCount - 1
  return HAND_CARD_ANGLE * (i - n/2) * HAND_ANGLE_FACTOR
}

const cardX = (i: number, cardCount: number): number => {
  const angle = cardAngle(i, cardCount)
  return HAND_POSITION_X + HAND_X_RADIUS * Math.sin(angle)
}

const cardY = (i: number, cardCount: number): number => {
  const angle = cardAngle(i, cardCount)
  return HAND_POSITION_Y - HAND_Y_RADIUS * Math.cos(angle)
}

export type Goal = {
  x: number,
  y: number,
  rotation: number,
  scale: number
}

export type Goals = {
  [card: Card]: Goal
}

const handGoal = (i: number, cardCount: number): Goal => ({
  x: cardX(i, cardCount),
  y: cardY(i, cardCount),
  rotation: cardAngle(i, cardCount),
  scale: CARD_SCALE
})

const handGoals = (moves: Moves, hand: Card[]): Goals => {
  const goals: Goals = {}
  hand.forEach((card, index) => {
    const move = moves[card]
    if (move !== undefined) {
      goals[card] = handGoal(index, hand.length)
    }
    return goals
  })
  return goals
}

export const handMoves = (moves: Moves, hand: Card[], currentTime: number): Moves => {
  let newMoves = {...moves}

  const goals: Goals = handGoals(moves, hand)

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

export const getMoves = (moves: Moves, hand: Card[], currentTime: number): Moves => {
  moves = handMoves(moves, hand, currentTime)
  return moves
}


/*
export type Hand = {
  readonly cards: Card.Card[],
}

function cardAngle(i: number, cardCount: number) {
  const n = cardCount - 1
  return HAND_CARD_ANGLE * (i - n/2)
}

function getCardPosition(i: number, cardCount: number) {
  const angle = cardAngle(i, cardCount)
  const x = HAND_POSITION_X + HAND_X_RADIUS * Math.sin(angle)
  const y = HAND_POSITION_Y - HAND_Y_RADIUS * Math.cos(angle)
  return [x, y]
}

function getCardRotation(i: number, cardCount: number) {
  let angle = cardAngle(i, cardCount)
  return angle * HAND_ANGLE_FACTOR
}

function moveCardDefault(
  card: Card.Card,
  cardIndex: number,
  cardCount: number,
  currentTime: number
): Card.Card {
  const [x, y] = getCardPosition(cardIndex, cardCount)
  const rotation = getCardRotation(cardIndex, cardCount)
  card = Card.move_x(card, x, currentTime)
  card = Card.move_y(card, y, currentTime)
  card = Card.rotate(card, rotation, currentTime)
  card = { ...card, zLevel: zLevel(cardIndex) }
  return Card.scale(card, CARD_SCALE, currentTime)
}

function zLevel(cardIndex: number): number {
  // + 10 to prevent first card going under emissions line card when zooming out
  return cardIndex + 10
}

function handWidth(hand: Hand): number {
  const leftCard = hand.cards[0]
  const rightCard = hand.cards[hand.cards.length - 1]
  return rightCard.x - leftCard.x + Canvas.CARD_WIDTH
}

function distance(a: number, b: number) {
  return Math.abs(a - b)
}

function closestCardToMouse(hand: Hand, mouseX: number): number | undefined {
  let closestCard: Card.Card | undefined
  let closestCardIndex: number | undefined
  let i: number = 0

  for (const card of hand.cards) {
    if (!closestCard) {
      closestCard = card
      closestCardIndex = i
    }

    if (distance(mouseX, card.x) < distance(mouseX, closestCard.x)) {
      closestCard = card
      closestCardIndex = i
    }

    i++
  }

  return closestCardIndex
}

const HOVER_Y_AXIS_LIMIT: number =
  HAND_POSITION_Y - HAND_Y_RADIUS - Canvas.CARD_HEIGHT / 2 * CARD_SCALE
function isCardFocused(
  hand: Hand,
  cardIndex: number,
  mouseX: number,
  mouseY: number
): boolean {
  const width = handWidth(hand)
  const closestCardIndex = closestCardToMouse(hand, mouseX)
  return closestCardIndex !== undefined &&
         cardIndex === closestCardIndex &&
         mouseY > HOVER_Y_AXIS_LIMIT &&
         mouseX > HAND_POSITION_X - width / 2 &&
         mouseX < HAND_POSITION_X + width / 2
}

function zoomInOnCard(card: Card.Card, currentTime: number): Card.Card {
  const scale = 1
  card = Card.move_y(card, Canvas.HEIGHT - Canvas.CARD_HEIGHT / 2 * scale, currentTime)
  card = Card.scale(card, scale, currentTime)
  card = Card.rotate(card, 0, currentTime)
  card = { ...card, zLevel: 999 }
  return card
}

function zoomHoveredCards(
  hand: Hand,
  mouseX: number,
  mouseY: number,
  currentTime: number
): Hand {
  return {
    ...hand,
    cards: hand.cards.map((card, cardIndex) => {
      if (isCardFocused(hand, cardIndex, mouseX, mouseY))
        return zoomInOnCard(card, currentTime)

      return moveCardDefault(card, cardIndex, hand.cards.length, currentTime)
    })
  }
}

export function create(): Hand {
  return { cards: [] }
}

export function addCard(hand: Hand, card: Card.Card, currentTime: number): Hand {
  card = Card.move_x(card, HAND_POSITION_X, currentTime)
  card = Card.move_y(card, HAND_POSITION_Y, currentTime)

  return {
    ...hand,
    cards: [...hand.cards, card]
  }
}

export function removeCard(hand: Hand, card: Card.Card): Hand {
  return {
    ...hand,
    cards: hand.cards.filter(c => c.id !== card.id)
  }
}

export function mouseClicked(hand: Hand, mouseX: number, mouseY: number): Hand {
  return {
    ...hand,
    cards: hand.cards.map((card, cardIndex) => {
      if (isCardFocused(hand, cardIndex, mouseX, mouseY))
        return { ...card, selected: true }

      return { ...card, selected: false }
    })
  }
}

export function update(hand: Hand, mouseX: number, mouseY: number, currentTime: number): Hand {
  let cards = hand.cards.map(card => Card.update(card, currentTime))
  hand = { ...hand, cards }
  return zoomHoveredCards(hand, mouseX, mouseY, currentTime)
}

export function selectedCard(hand: Hand): Card.Card | null {
  return hand.cards.find(card => card.selected) || null
}

export function draw(hand: Hand, cardName: string): [Hand, Card.Card] {
  const card = hand.cards.find(c => c.name === cardName)
  if (!card) throw new Error(`Card not found with ID: ${cardName}`)
  hand = { ...hand, cards: hand.cards.filter(c => c.name !== cardName) }
  return [hand, card]
}
*/
