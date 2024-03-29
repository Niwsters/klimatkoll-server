import { Card } from './card'
import { Position } from './position'
import { distance2D } from './util'

export const closestCard = (
  positions: Position[],
  mouseX: number,
  mouseY: number
): Card[] =>
  positions
    .sort((a, b) => distance2D(mouseX, mouseY, a.x, a.y) - distance2D(mouseX, mouseY, b.x, b.y))
    .slice(0, 1)
    .map(p => p.card)
