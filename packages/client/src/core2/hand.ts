import * as Animation from './animation'
import * as Canvas from '../components/Canvas'
import { WIDTH, HEIGHT } from '../core/constants'

export const HAND_POSITION_X = WIDTH / 2
export const HAND_POSITION_Y = HEIGHT + 50
export const HAND_CARD_ANGLE = Math.PI/5
export const HAND_X_RADIUS = 160
export const HAND_Y_RADIUS = 80
export const HAND_ANGLE_FACTOR = HAND_Y_RADIUS / HAND_X_RADIUS // The angle should not map to the same ellipse as the position

export type Hand = {
  readonly cards: Animation.AnimatedCard[],
  readonly selectedCardIndex?: number
}

function getCardAngle(i: number, cardCount: number) {
  const n = cardCount - 1
  return HAND_CARD_ANGLE * (i - n/2)
}

function getCardPosition(i: number, cardCount: number) {
  const angle = getCardAngle(i, cardCount)
  const x = HAND_POSITION_X + HAND_X_RADIUS * Math.sin(angle)
  const y = HAND_POSITION_Y - HAND_Y_RADIUS * Math.cos(angle)
  return [x, y]
}

function getCardRotation(i: number, cardCount: number) {
  let angle = getCardAngle(i, cardCount)
  return angle * HAND_ANGLE_FACTOR
}

function moveCardDefault(
  card: Animation.AnimatedCard,
  cardIndex: number,
  cardCount: number,
  currentTime: number
): Animation.AnimatedCard {
  const [x, y] = getCardPosition(cardIndex, cardCount)
  const scale = 1.0
  const rotation = getCardRotation(cardIndex, cardCount)
  card = Animation.move_x(card, x, currentTime)
  card = Animation.move_y(card, y, currentTime)
  card = Animation.rotate(card, rotation, currentTime)
  card = { ...card, zLevel: zLevel(cardIndex) }
  return Animation.scale(card, scale, currentTime)
}

function zLevel(cardIndex: number): number {
  // + 10 to prevent first card going under emissions line card when zooming out
  return cardIndex + 10
}

function handWidth(hand: Hand, currentTime: number): number {
  const leftCard = hand.cards[0]
  const rightCard = hand.cards[hand.cards.length - 1]
  return Animation.get_x(rightCard, currentTime) - Animation.get_x(leftCard, currentTime) + Canvas.CARD_WIDTH
}

function distance(a: number, b: number) {
  return Math.abs(a - b)
}

function closestCardToMouse(hand: Hand, mouseX: number, currentTime: number): number | undefined {
  let closestCard: Animation.AnimatedCard | undefined
  let closestCardIndex: number | undefined
  let i: number = 0

  for (const card of hand.cards) {
    if (!closestCard) {
      closestCard = card
      closestCardIndex = i
    }

    if (distance(mouseX, Animation.get_x(card, currentTime)) < distance(mouseX, Animation.get_x(closestCard, currentTime))) {
      closestCard = card
      closestCardIndex = i
    }

    i++
  }

  return closestCardIndex
}

const hoverYAxisLimit: number = HAND_POSITION_Y - Canvas.CARD_HEIGHT
function isCardFocused(
  hand: Hand,
  cardIndex: number,
  mouseX: number,
  mouseY: number,
  currentTime: number
): boolean {
  const width = handWidth(hand, currentTime)
  const closestCardIndex = closestCardToMouse(hand, mouseX, currentTime)
  return closestCardIndex !== undefined &&
         cardIndex === closestCardIndex &&
         mouseY > hoverYAxisLimit &&
         mouseX > HAND_POSITION_X - width / 2 &&
         mouseX < HAND_POSITION_X + width / 2
}

function zoomInOnCard(card: Animation.AnimatedCard, currentTime: number): Animation.AnimatedCard {
  card = Animation.move_y(card, HAND_POSITION_Y - 230, currentTime)
  card = Animation.scale(card, 2, currentTime)
  card = Animation.rotate(card, 0, currentTime)
  card = { ...card, zLevel: 999 }
  return card
}

function zoomHoveredCards(
  hand: Hand,
  currentTime: number,
  mouseX: number,
  mouseY: number
): Hand {
  return {
    ...hand,
    cards: hand.cards.map((card, cardIndex) => {
      if (isCardFocused(hand, cardIndex, mouseX, mouseY, currentTime))
        return zoomInOnCard(card, currentTime)

      return moveCardDefault(card, cardIndex, hand.cards.length, currentTime)
    })
  }
}

export function create(): Hand {
  return { cards: [] }
}

export function add_card(hand: Hand, card: Animation.AnimatedCard): Hand {
  card = Animation.move_x(card, HAND_POSITION_X, Date.now())
  card = Animation.move_y(card, HAND_POSITION_Y, Date.now())

  return {
    ...hand,
    cards: [...hand.cards, card]
  }
}


export function mouse_clicked(hand: Hand, mouseX: number, mouseY: number, currentTime: number): Hand {
  return {
    ...hand,
    cards: hand.cards.map((card, cardIndex) => {
      if (isCardFocused(hand, cardIndex, mouseX, mouseY, currentTime))
        return { ...card, selected: true }

      return { ...card, selected: false }
    })
  }
}

export function update(hand: Hand, currentTime: number, mouseX: number, mouseY: number): Hand {
  return zoomHoveredCards(hand, currentTime, mouseX, mouseY)
}
