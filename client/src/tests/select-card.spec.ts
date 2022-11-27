import { mouseClickedEvent, mouseMovedEvent } from '../event/event'
import { Card } from 'core/card'
import { ANIMATION_DURATION_MS } from 'core/constants'
import { GameState } from 'core/gamestate'
import { spec } from './spec'
import { Factory } from './test-factory'

const card = new Card(0, "some-card")
const card2 = new Card(1, "other-card")
const card3 = new Card(2, "third-card")

function addHandCards(state: GameState): GameState {
  state = state.new()
  state.hand = state.hand.addCard(card)
  state.hand = state.hand.addCard(card2)
  return finishAnimations(state)
}

function moveMouse(state: GameState, x: number, y: number): GameState {
  const event = { event_id: 0, ...mouseMovedEvent(x, y) }
  state = state.mouse_moved(event)[0]
  return state
}

function dontHoverAnyCard(state: GameState): GameState {
  state = moveMouse(state, -9999, -9999)
  return finishAnimations(state)
}

function hoverHandCard(state: GameState): GameState {
  const { x, y } = getCard(state).position
  state = moveMouse(state, x, y)
  return finishAnimations(state)
}

function hoverOtherCard(state: GameState): GameState {
  const { x, y } = getOtherCard(state).position
  state = moveMouse(state, x, y)
  return finishAnimations(state)
}

function finishAnimations(state: GameState): GameState {
  return state.update(state.lastUpdate).update(state.lastUpdate + ANIMATION_DURATION_MS)
}

function clickMouse(state: GameState): GameState {
  return state.mouse_clicked({ event_id: 1, ...mouseClickedEvent(0, 0)})[0]
}

function getCardById(state: GameState, cardID: number): Card {
  const found: Card | undefined = state.cards.find(c => c.id === cardID)
  if (!found) throw new Error("Could not find card")
  return found
}

function getCard(state: GameState): Card {
  return getCardById(state, card.id)
}

function isCardSelected(state: GameState): boolean {
  return getCard(state).selected
}

function getOtherCard(state: GameState): Card {
  return getCardById(state, card2.id)
}

function isOtherCardSelected(state: GameState): boolean {
  return getOtherCard(state).selected
}

function areSpaceCardsVisible(state: GameState): boolean {
  return state.cards.filter(c => c.isSpace).every(c => c.visible)
}

function addEmissionsLineCard(state: GameState): GameState {
  state = state.new()
  state.emissionsLine =  state.emissionsLine.addCard(card3, 0, state.lastUpdate)
  return state
}

function spaceCardNames(state: GameState): string[] {
  return [...new Set(state.cards.filter(c => c.isSpace).map(c => c.name))]
}

const spaceCardID = -1
function getSpaceCard(state: GameState): Card {
  const spaceCard = state.cards.find(c => c.id === spaceCardID)
  if (!spaceCard) throw new Error("Space card not found")
  return spaceCard
}

function hoverSpaceCard(state: GameState): GameState {
  const spaceCard = getSpaceCard(state)
  const { x, y } = spaceCard.position
  state = moveMouse(state, x, y)
  return finishAnimations(state)
}

function hoveredSpaceCardName(state: GameState): string {
  return getSpaceCard(state).name
}

export default function() {
  const handCardAdded = spec()
    .when(() => Factory.GameState())
    .when(addHandCards)
    .when(addEmissionsLineCard)

  handCardAdded.expect(areSpaceCardsVisible).toEqual(false)

  handCardAdded
    .when(dontHoverAnyCard)
    .when(clickMouse)
    .expect(isCardSelected)
    .toEqual(false)

  const selected = handCardAdded
    .when(hoverHandCard)
    .when(clickMouse)
    .when(finishAnimations)

  selected.expect(isCardSelected).toEqual(true)
  selected.expect(isOtherCardSelected).toEqual(false)
  selected.expect(areSpaceCardsVisible).toEqual(true)
  selected.expect(spaceCardNames).toEqual(["space"])

  const hoveredSpaceCard = selected
    .when(hoverSpaceCard)

  hoveredSpaceCard
    .expect(hoveredSpaceCardName)
    .toEqual(card.name)

  hoveredSpaceCard
    .when(dontHoverAnyCard)
    .expect(hoveredSpaceCardName)
    .toEqual("space")

  const otherCardSelected = selected
    .when(hoverOtherCard)
    .when(clickMouse)

  otherCardSelected.expect(isCardSelected).toEqual(false)
  otherCardSelected.expect(isOtherCardSelected).toEqual(true)
}
