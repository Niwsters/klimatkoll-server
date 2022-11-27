import { Card } from "core/card"
import { ANIMATION_DURATION_MS } from "core/constants"
import { GameState } from "core/gamestate"
import { Factory } from './test-factory'
import { spec } from './spec'

const currentTime = 1337
const card = new Card(0, "some-card")

function finishAnimation(state: GameState): GameState {
  return state.update(state.lastUpdate).update(state.lastUpdate + ANIMATION_DURATION_MS)
}

function addCard(state: GameState): GameState {
  state = state.new()
  state.emissionsLine = state.emissionsLine.addCard(card, 0, currentTime)
  return state
}

function emissionsLineZIndexes(state: GameState): number[] {
  return state.emissionsLine.cards.map(c => c.zLevel)
}

export default function main() {
  spec()
    .when(() => Factory.GameState())
    .when(addCard)
    .when(finishAnimation)
    .expect(emissionsLineZIndexes)
    .toEqual([10, 11, 12])
}
