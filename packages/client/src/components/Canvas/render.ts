import { Moves } from '../../core2/move'
import { Card, CardPosition, Reflection, ZLevel } from '../../core2/card'
import { CardDesign } from '../../core2/card_design'

import { drawCards } from './draw_card'
import { transpose } from '../../core2/transition'

export function render(
  context: CanvasRenderingContext2D,
  designs: CardDesign[],
  positions: CardPosition[],
  visible: Card[],
  flipped: Card[],
  selected: Card[],
  spaceCards: Card[],
  reflections: Reflection[],
  zLevels: ZLevel[],
  moves: Moves,
) {
  let previousTimestamp: number = -1

  let animationId: number | undefined
  function draw(timestamp: number) {
    context.fillStyle = '#ccc'
    context.fillRect(0, 0, context.canvas.width, context.canvas.height)

    if (previousTimestamp === -1)
      previousTimestamp = timestamp

    let positionsDict = {}
    for (const position of positions) {
      positionsDict[position.card] = position
    }

    for (const card in moves) {
      // move x
      const move = moves[card]
      const position = positionsDict[card]

      const { x, y, rotation, scale } = move
      positionsDict[card] = {
        ...position,
        x: transpose(x.from, x.to, x.started, Date.now()),
        y: transpose(y.from, y.to, y.started, Date.now()),
        rotation: transpose(rotation.from, rotation.to, rotation.started, Date.now()),
        scale: transpose(scale.from, scale.to, scale.started, Date.now()),
      }
    }

    positions = Object.values(positionsDict)

    drawCards(
      context,
      positions,
      designs,
      visible,
      flipped,
      selected,
      spaceCards,
      reflections,
      zLevels
    )

    animationId = requestAnimationFrame(draw)
  }

  animationId = requestAnimationFrame(draw)
  return () => {
    if (animationId !== undefined) cancelAnimationFrame(animationId)
  }
}
