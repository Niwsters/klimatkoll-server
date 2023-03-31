import { Card, CardPosition } from './card'
import { Movements } from './move'
import { transpose } from './transition'

export const positions = (moves: Movements): CardPosition[] => {
  let positionsDict: {[card: Card]: CardPosition} = {}
  for (const card in moves) {
    const move = moves[card]
    if (move !== undefined) {
      const { x, y, rotation, scale } = move
      positionsDict[card] = {
        card,
        x: transpose(x.from, x.to, x.started, Date.now()),
        y: transpose(y.from, y.to, y.started, Date.now()),
        rotation: transpose(rotation.from, rotation.to, rotation.started, Date.now()),
        scale: transpose(scale.from, scale.to, scale.started, Date.now()),
      }
    }
  }
  return Object.values(positionsDict)
}
