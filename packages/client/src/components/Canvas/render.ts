import { Move } from '../../core2/move'
import { Card, CardPosition, Reflection } from '../../core2/card'
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
  moves: Move[]
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

    for (const move of moves) {
      const position = positionsDict[move.card]
      const from = position[move.field]

      positionsDict[move.card] = {
        ...position,
        [move.field]: transpose(from, move.to, move.timestamp, Date.now())
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
      reflections
    )

    animationId = requestAnimationFrame(draw)
  }

  animationId = requestAnimationFrame(draw)
  return () => {
    if (animationId !== undefined) cancelAnimationFrame(animationId)
  }
}
