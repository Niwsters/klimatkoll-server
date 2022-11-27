import { EventToAdd, mouseClickedEvent, mouseMovedEvent, playCardRequestEvent } from '../event/event'
import { Card } from 'core/card'
import { ANIMATION_DURATION_MS } from 'core/constants'
import { GameState } from 'core/gamestate'
import { spec } from './spec'
import { Factory } from './test-factory'

const currentTime = 1337
const emissionsLineCard = new Card(0, "some-card")
const handCard = new Card(2, "third-card")

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

function finishAnimation(state: GameState): GameState {
  return state.update(state.lastUpdate).update(state.lastUpdate + ANIMATION_DURATION_MS)
}

function addEmissionsLineCard(state: GameState): GameState {
  state = state.new()
  state.emissionsLine = state.emissionsLine.addCard(emissionsLineCard, 0, currentTime)
  return state
}

function addHandCard(state: GameState): GameState {
  state = state.new()
  state.hand = state.hand.addCard(handCard)
  return finishAnimation(state)
}

function getHandCard(state: GameState): Card {
  return getCardById(state, handCard.id)
}

function hoverCard(state: GameState, card: Card): GameState {
  return moveMouse(state, card.position.x, card.position.y)
}

function hoverHandCard(state: GameState): GameState {
  return hoverCard(state, getHandCard(state))
}

function clickMouse(state: GameState): [GameState, EventToAdd[]] {
  return state.mouse_clicked({ event_id: 1, ...mouseClickedEvent(0, 0) })
}

function selectHandCard(state: GameState): GameState {
  return clickMouse(hoverHandCard(state))[0]
}

function hoverSpaceCard(state: GameState): GameState {
  const card = getCardById(state, -2)
  return hoverCard(state, card)
}

function events(result: [GameState, EventToAdd[]]) {
  return result[1]
}

export default function() {
  spec()
    .when(() => Factory.GameState())
    .when(addEmissionsLineCard)
    .when(addHandCard)
    .when(selectHandCard)
    .when(hoverSpaceCard)
    .when(clickMouse)
    .expect(events)
    .toEqual([playCardRequestEvent(handCard.id, 2)])
}
