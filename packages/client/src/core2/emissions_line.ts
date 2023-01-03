import * as Animation from './animation'
import { AnimatedCard } from './animation'
import * as Canvas from '../components/Canvas'
import { Card } from './card'

const EMISSIONS_LINE_MAX_LENGTH = Canvas.WIDTH
const EMISSIONS_LINE_POSITION_X = Canvas.WIDTH / 2
const EMISSIONS_LINE_POSITION_Y = Canvas.HEIGHT / 2
const CARD_SCALE = 0.5
export const NO_CARD_SELECTED = null

function spaceCard(visible: boolean): AnimatedCard {
  return Animation.from_card({
    title: "",
    subtitle: "",
    emissions: 0,
    isSpace: true,
    visible
  })
}

function reform_space_cards(cards: AnimatedCard[], isCardSelected: boolean): AnimatedCard[] {
  cards = cards.filter(c => !c.isSpace)
  cards = cards.reduce((cards: AnimatedCard[], card) => {
    return [
      ...cards,
      card,
      spaceCard(isCardSelected)
    ]
  }, [spaceCard(isCardSelected)])
  return cards
}

export type EmissionsLine = {
  cards: Animation.AnimatedCard[],
  selectedCard: Card | null
}

export function create(): EmissionsLine {
  return { cards: [], selectedCard: null }
}

function card_distance(el: EmissionsLine): number {
  const cardCount = el.cards.length
  const cardWidth = Canvas.CARD_WIDTH * CARD_SCALE
  const totalELWidth = cardWidth * cardCount
  let cardDistance = cardWidth / 2
  if (totalELWidth > EMISSIONS_LINE_MAX_LENGTH) {
    cardDistance = (EMISSIONS_LINE_MAX_LENGTH - cardWidth) / (cardCount-1)
  }
  return cardDistance
}

function move_card(el: EmissionsLine, card: AnimatedCard, i: number, currentTime: number): AnimatedCard {
  const cardCount = el.cards.length
  const width = card_distance(el)
  const startOffset = 0 - width*cardCount/2 - width/2

  const x = EMISSIONS_LINE_POSITION_X + startOffset + width * i
  const y = EMISSIONS_LINE_POSITION_Y
  card = Animation.move_x(card, x, currentTime)
  card = Animation.move_y(card, y, currentTime)
  return card
}

function show_hide_space_cards(el: EmissionsLine): EmissionsLine {
  let cards = el.cards.map(card => {
    if (!card.isSpace) return card

    if (el.selectedCard === NO_CARD_SELECTED)
      return { ...card, visible: false }
    else
      return { ...card, visible: true }
  })

  return { ...el, cards }
}

export function add_card(el: EmissionsLine, card: Animation.AnimatedCard, currentTime: number): EmissionsLine {
  card = { ...card, flipped: true }
  let cards = [...el.cards, card]
  cards = reform_space_cards(cards, el.selectedCard !== null)
  cards = cards.map(card => Animation.scale(card, CARD_SCALE, currentTime))
  cards = cards.map((card, i) => move_card(el, card, i, currentTime))

  return {
    ...el,
    cards
  }
}

export function card_selected(el: EmissionsLine, selectedCard: Card | null): EmissionsLine {
  return show_hide_space_cards({ ...el, selectedCard })
}
