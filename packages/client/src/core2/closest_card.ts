import { Card, CardPosition } from './card'
import { distance2D } from './util'

export const closestCard = (
  positions: CardPosition[],
  mouseX: number,
  mouseY: number
): Card[] =>
  positions
    .sort((a, b) => distance2D(mouseX, mouseY, a.x, a.y) - distance2D(mouseX, mouseY, b.x, b.y))
    .slice(0, 1)
    .map(p => p.card)
