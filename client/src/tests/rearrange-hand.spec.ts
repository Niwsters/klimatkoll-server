import { Card } from 'core/card'
import { ICard } from '@shared/models'
import {
  HAND_POSITION,
  HAND_X_RADIUS,
  HAND_Y_RADIUS,
  HAND_CARD_ANGLE,
  ANIMATION_DURATION_MS,
} from 'core/constants'
import { Factory } from './test-factory'
import { spec } from './spec'
import { mouseMovedEvent } from '../event/event'
import { Position } from 'core/position'

const currentTime = 1337

function getHandCardPosition(i: number, cardCount: number): Position {
  const n = cardCount - 1
  let angle = HAND_CARD_ANGLE * (i - n/2)
  let x = HAND_POSITION.x + HAND_X_RADIUS * Math.sin(angle)
  let y = HAND_POSITION.y - HAND_Y_RADIUS * Math.cos(angle)

  return new Position(x, y)
}

function initialiseCards(): [Card, Card] {
  let card = new Card(0, "blargh")
  let card2 = new Card(1, "1337")
  return [card, card2]
}

function moveCard(card: Card, position: Position, rotation: number, scale: number, zLevel: number): Card {
  card = card.move(position.x, position.y, currentTime)
  card = card.rotateGlobal(rotation, currentTime)
  card = card.setScale(scale, currentTime)
  card.zLevel = zLevel 
  return card.update(currentTime + ANIMATION_DURATION_MS)
}

function expectedCards(): [ICard, ICard] {
  let [card, card2] = initialiseCards()

  card = moveCard(card, getHandCardPosition(0, 2), -0.15707963267948966, 0.275, 10)
  card2 = moveCard(card2, getHandCardPosition(1, 2), 0.15707963267948966, 0.275, 11)

  return [card, card2]
}

export default function main() {
  spec()
    .when(() => {
      const [card, card2] = initialiseCards()

      let state = Factory.GameState()
      state.hand = state.hand
        .addCard(card)
        .addCard(card2)
      state = state.mouse_moved({event_id: 0, ...mouseMovedEvent(0, 0)})[0]

      return state.update(currentTime).update(currentTime + ANIMATION_DURATION_MS)
    })
    .expect(state => state.cards)
    .toEqual(expectedCards())
}
