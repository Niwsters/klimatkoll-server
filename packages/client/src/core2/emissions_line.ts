import { Card, CardPosition, Reflection } from './card'
import { PositionGoal, PositionGoals } from './move'
import { WIDTH, HEIGHT, CARD_WIDTH, CARD_HEIGHT } from './constants'
import { distance, entries } from './util'
import { ZLevel } from './z_levels'

const EMISSIONS_LINE_MAX_LENGTH = WIDTH
const EMISSIONS_LINE_POSITION_X = WIDTH / 2
const EMISSIONS_LINE_POSITION_Y = HEIGHT / 2
const CARD_SCALE = 0.5

function cardDistance(cardCount: number): number {
  const cardWidth = CARD_WIDTH * CARD_SCALE
  const totalELWidth = cardWidth * cardCount
  let cardDistance = cardWidth
  if (totalELWidth > EMISSIONS_LINE_MAX_LENGTH) {
    cardDistance = (EMISSIONS_LINE_MAX_LENGTH - cardWidth) / (cardCount-1)
  }
  return cardDistance
}

const cardX = (index: number, cardCount: number): number => {
  const width = cardDistance(cardCount)
  const startOffset = 0 - width/2
  const result = EMISSIONS_LINE_POSITION_X + startOffset + width * index
  return result
}

const cardY = () => {
  return EMISSIONS_LINE_POSITION_Y
}

const goal = (index: number, cardCount: number): PositionGoal => ({
  x: cardX(index, cardCount),
  y: cardY(),
  rotation: 0,
  scale: CARD_SCALE
})

export const emissionsLineGoals = (emissionsLine: Card[]): PositionGoals => {
  const goals: PositionGoals = {}
  emissionsLine.forEach((card, index) => {
    goals[card] = goal(index, emissionsLine.length)
  })
  return goals
}

export type SpaceCards = Card[]

const spaceCard = (index: number): Card => "space-" + index

export const getSpaceCards = (el: Card[]) => {
  let spaceCards: Card[] = [spaceCard(0)]
  el.forEach((_, index) => {
    spaceCards.push(spaceCard(index+1))
  })
  for (const _ of el) {
  }
  return spaceCards
}

export const spaceCardsGoals = (spaceCards: SpaceCards): PositionGoals => {
  const goals = emissionsLineGoals(spaceCards)
  const newGoals = {...goals}
  for (const [card, goal] of entries(goals)) {
    const newGoal = {
      ...goal,
      x: goal.x - CARD_WIDTH / 4
    }
    newGoals[card] = newGoal
  }
  return newGoals
}

export const zLevels = (emissionsLine: Card[], spaceCards: SpaceCards): ZLevel[] =>
  [
    ...spaceCards.map((card, index) => ({ card, zLevel: index-1 })),
    ...emissionsLine.map((card, index) => ({ card, zLevel: index }))
  ]

const width = (positions: CardPosition[]): number => {
  let leftCardX = 0
  let rightCardX = 0
  for (const position of positions) {
    const x = position.x
    if (leftCardX === 0)
      leftCardX = x

    if (rightCardX === 0)
      rightCardX = x

    if (x < leftCardX)
      leftCardX = x

    if (x > rightCardX)
      rightCardX = x
  }

  const cardWidth = CARD_WIDTH * CARD_SCALE
  const x1 = leftCardX - cardWidth / 2
  const x2 = rightCardX + cardWidth / 2

  return x2 - x1 
}

const closestCard = (
  positions: CardPosition[],
  mouseX: number
): Card[] =>
  positions
    .sort((a, b) => distance(mouseX, a.x) - distance(mouseX, b.x))
    .slice(0, 1)
    .map(p => p.card)
  /*
  for (const [card, goal] of entries(goals)) {
    if (!closest) {
      closest = card
      continue
    }

    if (Math.abs(card.x - mouseX) < Math.abs(closest.x - mouseX)) {
      closest = card
    }
  }
  */

const mouseWithinBounds = (width: number, mouseX: number, mouseY: number): boolean => {
  const lowerBoundsY = EMISSIONS_LINE_POSITION_Y - CARD_HEIGHT * CARD_SCALE / 2
  const upperBoundsY = EMISSIONS_LINE_POSITION_Y + CARD_HEIGHT * CARD_SCALE / 2

  const lowerBoundsX = EMISSIONS_LINE_POSITION_X - width / 2
  const upperBoundsX = EMISSIONS_LINE_POSITION_X + width / 2

  return mouseX > lowerBoundsX &&
         mouseX < upperBoundsX &&
         mouseY > lowerBoundsY &&
         mouseY < upperBoundsY
}

export const focusedCards = (
  cards: Card[],
  positions: CardPosition[],
  mouseX: number,
  mouseY: number
): Card[] => {
  const cardsSet = new Set(cards)
  positions = positions.filter(p => cardsSet.has(p.card))

  if (mouseWithinBounds(width(positions), mouseX, mouseY)) {
    return closestCard(positions, mouseX)
  }

  return []
}

/*
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

export function addCard(el: EmissionsLine, card: Card.Card, position: number, currentTime: number): EmissionsLine {
  card = { ...card, flipped: true }
  let cards = [...el.cards.slice(0, position), card, ...el.cards.slice(position+1)]
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

export function focusedCard(el: EmissionsLine, mouseX: number, mouseY: number): [Card.Card, number] | [] {
  const index = el.cards.findIndex(card => isCardFocused(el, card, mouseX, mouseY))
  const card = el.cards[index]
  return [card, index]
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
*/
