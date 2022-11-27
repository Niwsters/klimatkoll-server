import { mouseClickedEvent, mouseMovedEvent } from "../event/event"
import { Card } from "core/card"
import { ANIMATION_DURATION_MS, EMISSIONS_LINE_POSITION } from "core/constants"
import { GameState } from "core/gamestate"
import { Factory } from './test-factory'
import { spec } from './spec'

const currentTime = 1337
const card = new Card(0, "some-card")
const card2 = new Card(1, "other-card")
const card3 = new Card(2, "third-card")

function moveMouse(state: GameState, x: number, y: number): GameState {
  const event = {...mouseMovedEvent(x, y), event_id: 0}
  state = state.mouse_moved(event)[0]
  state = state.update(currentTime + ANIMATION_DURATION_MS)
  return state
}

function getCardById(state: GameState, cardID: number): Card {
  const card = state.cards.find(c => c.id === cardID)
  if (!card) throw new Error("Can't find card")
  return card
}

function cardScale(state: GameState): number {
  return getCardById(state, card.id).scale
}

function otherCardScale(state: GameState): number {
  return getCardById(state, card2.id).scale
}

function getOtherCards(state: GameState) {
  return state.emissionsLine.cards.filter(c => c.id !== card.id)
}

function unique(array: any[]) {
  return [...new Set(array)]
}

function finishAnimation(state: GameState): GameState {
  return state.update(state.lastUpdate).update(state.lastUpdate + ANIMATION_DURATION_MS)
}

function addCard(state: GameState): GameState {
  state = state.new()
  state.emissionsLine = state.emissionsLine.addCard(card, 0, currentTime)
  return state
}

function hoverCard(state: GameState): GameState {
  const [x, y] = [EMISSIONS_LINE_POSITION.x, EMISSIONS_LINE_POSITION.y]
  return moveMouse(state, x, y)
}

function otherCardScales(state: GameState): number[] {
  return unique(getOtherCards(state).map(c => c.scale))
}

function dontHoverAnyCard(state: GameState): GameState {
  return moveMouse(state, 0, 0)
}

function addHandCard(state: GameState): GameState {
  state = state.new()
  state.hand = state.hand.addCard(card3)
  return finishAnimation(state)
}

function handCard(state: GameState): Card {
  return getCardById(state, card3.id)
}

function hoverHandCard(state: GameState): GameState {
  const card = handCard(state)
  return moveMouse(state, card.position.x, card.position.y)
}

function clickMouse(state: GameState): GameState {
  return state.mouse_clicked({ event_id: 1, ...mouseClickedEvent(0, 0) })[0]
}

function selectHandCard(state: GameState): GameState {
  return clickMouse(hoverHandCard(state))
}

function cardZIndex(state: GameState): number {
  return getCardById(state, card.id).zLevel
}

export default function main() {
  const test = spec()
    .when(() => Factory.GameState())
    .when(addCard)

  const hovering = test
    .when(hoverCard)
    .when(finishAnimation)

  // zooms in on emissions line card
  hovering.expect(cardScale).toEqual(Card.DEFAULT_SCALE * 2)
  hovering.expect(cardZIndex).toEqual(999)
  // doesn't zoom in on surrounding cards
  hovering.expect(otherCardScales).toEqual([Card.DEFAULT_SCALE])


  // zooms out if mouse moves outside emissions line Y bounds
  hovering
    .when(dontHoverAnyCard)
    .when(finishAnimation)
    .expect(cardScale)
    .toEqual(Card.DEFAULT_SCALE)

  // zooms in only on the closest card to the mouse
  const twoCards = test
    .when((state: GameState) => {
      state = state.new()
      const card = new Card(card2.id, card2.name, EMISSIONS_LINE_POSITION)
      state.emissionsLine = state.emissionsLine.addCard(card, 2, currentTime)

      const [x, y] = [card.position.x, EMISSIONS_LINE_POSITION.y]
      return moveMouse(state, x, y)
    })
    .when(finishAnimation)
  twoCards.expect(cardScale).toEqual(Card.DEFAULT_SCALE * 2)
  twoCards.expect(otherCardScale).toEqual(Card.DEFAULT_SCALE)

  // zooms in only if mouse is within emissions line x-axis
  test
    .when((state: GameState) => {
      const y = EMISSIONS_LINE_POSITION.y
      return moveMouse(state, 0, y)
    })
    .expect(cardScale)
    .toEqual(Card.DEFAULT_SCALE)

  // doesn't zoom in if hand card is selected
  test
    .when(addHandCard)
    .when(selectHandCard)
    .when(hoverCard)
    .when(finishAnimation)
    .expect(cardScale)
    .toEqual(Card.DEFAULT_SCALE)
}
