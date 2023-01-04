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
    descr_front: "",
    descr_back: "",
    bg_color_back: "",
    bg_color_front: "",
    duration: "",
    flipped: false,
    selected: false,

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

function width(el: EmissionsLine, currentTime: number): number {
  let leftCard: AnimatedCard | undefined
  let rightCard: AnimatedCard | undefined
  for (const card of el.cards) {
    if (!leftCard)
      leftCard = card

    if (!rightCard)
      rightCard = card

    if (Animation.get_x(card, currentTime) < Animation.get_x(leftCard, currentTime))
      leftCard = card

    if (Animation.get_x(card, currentTime) > Animation.get_x(rightCard, currentTime))
      rightCard = card
  }

  if (!leftCard || !rightCard)
    return 0

  const cardWidth = Canvas.CARD_WIDTH * CARD_SCALE
  const x1 = Animation.get_x(leftCard, currentTime) - cardWidth / 2
  const x2 = Animation.get_x(rightCard, currentTime) + cardWidth / 2

  return x2 - x1 
}


function nonSpaceCards(el: EmissionsLine): AnimatedCard[] {
  return el.cards.filter(c => !c.isSpace)
}

function spaceCards(el: EmissionsLine): AnimatedCard[] {
  return el.cards.filter(c => c.isSpace)
}

function isCardSelected(el: EmissionsLine): boolean {
  return el.selectedCard !== null
}

function getClosestCardIndex(
  el: EmissionsLine,
  mouseX: number,
  currentTime: number
): number {
  const cards = isCardSelected(el) ? spaceCards(el) : nonSpaceCards(el)

  let closest: AnimatedCard = cards[0]
  let closestIndex: number = 0
  let i = 0
  for (const card of cards) {
    if (!closest) {
      closest = card
      continue
    }

    if (Math.abs(Animation.get_x(card, currentTime) - mouseX) < Math.abs(Animation.get_x(closest, currentTime) - mouseX)) {
      closest = card
      closestIndex = i
    }

    i++
  }

  return closestIndex
}

function isCardFocused(
  el: EmissionsLine,
  cardIndex: number,
  mouseX: number,
  mouseY: number,
  currentTime: number
): boolean {
  const lowerBoundsY = EMISSIONS_LINE_POSITION_Y - Canvas.CARD_HEIGHT * CARD_SCALE / 2
  const upperBoundsY = EMISSIONS_LINE_POSITION_Y + Canvas.CARD_HEIGHT * CARD_SCALE / 2

  const lowerBoundsX = EMISSIONS_LINE_POSITION_X - width(el, currentTime) / 2
  const upperBoundsX = EMISSIONS_LINE_POSITION_X + width(el, currentTime) / 2

  return mouseX > lowerBoundsX &&
         mouseX < upperBoundsX &&
         mouseY > lowerBoundsY &&
         mouseY < upperBoundsY &&
         cardIndex === getClosestCardIndex(el, mouseX, currentTime)
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

export function update(
  el: EmissionsLine,
  mouseX: number,
  mouseY: number,
  currentTime: number
): EmissionsLine {
  const cards = el.cards.map((card, cardIndex) => {
    if (card.isSpace) {
      const position = {
        x: Animation.get_x(card, currentTime),
        y: Animation.get_y(card, currentTime),
        scale: CARD_SCALE
      }

      if (
        isCardFocused(el, cardIndex, mouseX, mouseY, currentTime)
        && isCardSelected(el)
      ) {
        const selectedCard = {
          ...el.selectedCard as Card,
          selected: false,
          isSpace: true
        }

        return Animation.from_card(selectedCard, position)
      }

      return Animation.from_card(spaceCard(isCardSelected(el)), position)
    }

    return { ...card }
  })

  return {
    ...el,
    cards
  }
}
