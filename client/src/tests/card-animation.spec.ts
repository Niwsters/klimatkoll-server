import { Card } from 'core/card'
import { ANIMATION_DURATION_MS } from 'core/constants'
import { Position } from 'core/position'
import { spec } from './spec'

function finishAnimation(card: Card): Card {
  return card.update(ANIMATION_DURATION_MS)
}

export default function main() {
  const test = spec().when(() => new Card(3, "blargh", new Position(0, 0)))

  test
    .when((card: Card) => card.move(1337, 1337, 0))
    .when(finishAnimation)
    .expect((card: Card) => card.position).toEqual(new Position(1337, 1337))

  test
    .when((card: Card) => card.rotateGlobal(1337, 0))
    .when(finishAnimation)
    .expect(card => card.rotation).toEqual(1337)

  test
    .when(card => card.rotateLocal(1337, 0))
    .when(finishAnimation)
    .expect(card => card.addedRotation).toEqual(1337)

  test
    .when(card => card.setScale(1337, 0))
    .when(finishAnimation)
    .expect(card => card.scale).toEqual(1337)
}
