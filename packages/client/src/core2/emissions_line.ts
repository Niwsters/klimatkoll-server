import * as Canvas from '../components/Canvas'
import * as Card from './card'

const EMISSIONS_LINE_MAX_LENGTH = Canvas.WIDTH
const EMISSIONS_LINE_POSITION_X = Canvas.WIDTH / 2
const EMISSIONS_LINE_POSITION_Y = Canvas.HEIGHT / 2
const CARD_SCALE = 0.5
export const NO_CARD_SELECTED = null

function spaceCard(visible: boolean, position: { x: number, y: number, scale: number } = { x: 0, y: 0, scale: 1 }): Card.Card {
  const positioning = {
    ...position,
    rotation: 0,
    zLevel: 0
  }

  return Card.spaceCard(positioning, visible)
}

function reformSpaceCards(cards: Card.Card[], isCardSelected: boolean): Card.Card[] {
  cards = cards.filter(c => !c.isSpace)
  cards = cards.reduce((cards: Card.Card[], card) => {
    return [
      ...cards,
      card,
      spaceCard(isCardSelected)
    ]
  }, [spaceCard(isCardSelected)])
  return cards
}

export type EmissionsLine = {
  cards: Card.Card[],
  selectedCard: Card.Card | null
}

export function create(): EmissionsLine {
  return { cards: [], selectedCard: null }
}

function cardDistance(el: EmissionsLine): number {
  const cardCount = el.cards.length
  const cardWidth = Canvas.CARD_WIDTH * CARD_SCALE
  const totalELWidth = cardWidth * cardCount
  let cardDistance = cardWidth / 2
  if (totalELWidth > EMISSIONS_LINE_MAX_LENGTH) {
    cardDistance = (EMISSIONS_LINE_MAX_LENGTH - cardWidth) / (cardCount-1)
  }
  return cardDistance
}

function move_card(el: EmissionsLine, card: Card.Card, i: number, currentTime: number): Card.Card {
  const cardCount = el.cards.length
  const width = cardDistance(el)
  const startOffset = 0 - width*cardCount/2 - width/2

  const x = EMISSIONS_LINE_POSITION_X + startOffset + width * i
  const y = EMISSIONS_LINE_POSITION_Y
  card = Card.move_x(card, x, currentTime)
  card = Card.move_y(card, y, currentTime)
  return card
}

function showHideSpaceCards(el: EmissionsLine): EmissionsLine {
  let cards = el.cards.map(card => {
    if (!card.isSpace) return card

    if (el.selectedCard === NO_CARD_SELECTED)
      return { ...card, visible: false }
    else
      return { ...card, visible: true }
  })

  return { ...el, cards }
}

function width(el: EmissionsLine): number {
  let leftCard: Card.Card | undefined
  let rightCard: Card.Card | undefined
  for (const card of el.cards) {
    if (!leftCard)
      leftCard = card

    if (!rightCard)
      rightCard = card

    if (card.x < leftCard.x)
      leftCard = card

    if (card.x > rightCard.x)
      rightCard = card
  }

  if (!leftCard || !rightCard)
    return 0

  const cardWidth = Canvas.CARD_WIDTH * CARD_SCALE
  const x1 = leftCard.x - cardWidth / 2
  const x2 = rightCard.x + cardWidth / 2

  return x2 - x1 
}


function nonSpaceCards(el: EmissionsLine): Card.Card[] {
  return el.cards.filter(c => !c.isSpace)
}

function spaceCards(el: EmissionsLine): Card.Card[] {
  return el.cards.filter(c => c.isSpace)
}

function isCardSelected(el: EmissionsLine): boolean {
  return el.selectedCard !== null
}

function getClosestCard(
  el: EmissionsLine,
  mouseX: number
): Card.Card {
  const cards = isCardSelected(el) ? spaceCards(el) : nonSpaceCards(el)

  let closest: Card.Card = cards[0]
  for (const card of cards) {
    if (!closest) {
      closest = card
      continue
    }

    if (Math.abs(card.x - mouseX) < Math.abs(closest.x - mouseX)) {
      closest = card
    }
  }

  return closest
}

function isCardFocused(
  el: EmissionsLine,
  card: Card.Card,
  mouseX: number,
  mouseY: number
): boolean {
  const lowerBoundsY = EMISSIONS_LINE_POSITION_Y - Canvas.CARD_HEIGHT * CARD_SCALE / 2
  const upperBoundsY = EMISSIONS_LINE_POSITION_Y + Canvas.CARD_HEIGHT * CARD_SCALE / 2

  const lowerBoundsX = EMISSIONS_LINE_POSITION_X - width(el) / 2
  const upperBoundsX = EMISSIONS_LINE_POSITION_X + width(el) / 2

  return mouseX > lowerBoundsX &&
         mouseX < upperBoundsX &&
         mouseY > lowerBoundsY &&
         mouseY < upperBoundsY &&
         card.id === getClosestCard(el, mouseX).id
}

function zLevel(cardIndex: number): number {
  return cardIndex
}

export function addCard(el: EmissionsLine, card: Card.Card, currentTime: number): EmissionsLine {
  card = { ...card, flipped: true }
  let cards = [...el.cards, card]
  cards = reformSpaceCards(cards, el.selectedCard !== null)
  cards = cards.map(card => Card.scale(card, CARD_SCALE, currentTime))
  cards = cards.map((card, i) => move_card(el, card, i, currentTime))

  return {
    ...el,
    cards
  }
}

export function cardSelected(el: EmissionsLine, selectedCard: Card.Card | null): EmissionsLine {
  return showHideSpaceCards({ ...el, selectedCard })
}

export function focusedCard(el: EmissionsLine, mouseX: number, mouseY: number): Card.Card | undefined {
  return el.cards.find(card => isCardFocused(el, card, mouseX, mouseY))
}

export function update(
  el: EmissionsLine,
  mouseX: number,
  mouseY: number,
  currentTime: number
): EmissionsLine {
  let cards = el.cards
  cards = cards.map((card, cardIndex) => { return {...card, zLevel: zLevel(cardIndex)} })
  cards = cards.map(card => Card.update(card, currentTime))
  cards = cards.map(card => {
    if (card.isSpace) {
      if (
        isCardFocused(el, card, mouseX, mouseY)
        && isCardSelected(el)
      ) {
        const selectedCard = el.selectedCard as Card.Card
        return { ...card, name: selectedCard.name }
      }

      return {...card, name: "space"}
    }

    return { ...card }
  })

  return {
    ...el,
    cards
  }
}
