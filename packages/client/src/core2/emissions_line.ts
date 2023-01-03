import * as Animation from './animation'
import { AnimatedCard } from './animation'
import * as Canvas from '../components/Canvas'
import { Card } from './card'

const EMISSIONS_LINE_MAX_LENGTH = 450
const EMISSIONS_LINE_POSITION_X = Canvas.WIDTH / 2
const EMISSIONS_LINE_POSITION_Y = Canvas.HEIGHT / 2
const CARD_SCALE = 0.5

export type EmissionsLine = {
  cards: Animation.AnimatedCard[]
}

export function create(): EmissionsLine {
  return {
    cards: []
  }
}

function getEmissionsLineCardDistance(el: EmissionsLine): number {
  const cardCount = el.cards.length
  const cardWidth = Canvas.CARD_WIDTH * CARD_SCALE
  const totalELWidth = cardWidth * cardCount
  let cardDistance = cardWidth
  if (totalELWidth > EMISSIONS_LINE_MAX_LENGTH) {
    cardDistance = (EMISSIONS_LINE_MAX_LENGTH - cardWidth) / (cardCount-1)
  }
  return cardDistance
}

function move_card(el: EmissionsLine, card: AnimatedCard, i: number, currentTime: number): AnimatedCard {
  const cardCount = el.cards.length
  const width = getEmissionsLineCardDistance(el)
  const startOffset = 0 - width*cardCount/2

  const x = EMISSIONS_LINE_POSITION_X + startOffset + width * i
  const y = EMISSIONS_LINE_POSITION_Y
  card = Animation.move_x(card, x, currentTime)
  card = Animation.move_y(card, y, currentTime)
  return card
}

export function add_card(el: EmissionsLine, card: Animation.AnimatedCard, currentTime: number): EmissionsLine {
  card = { ...card, flipped: true }
  card = Animation.scale(card, CARD_SCALE, currentTime)
  let cards = [...el.cards, card]
  cards = cards.map((card, i) => move_card(el, card, i, currentTime))

  return {
    ...el,
    cards
  }
}

export function card_selected(el: EmissionsLine, selectedCard: Card | undefined, currentTime: number): EmissionsLine {
  return { ...el }
}
