import { Movements } from './move'
import { Card, CardPosition, Reflection, ZLevel } from './card'
import { CardDesign } from './card_design'

import { CardToDraw, drawCards } from './draw_card'
import { transpose } from './transition'
import { createDrawingQueue } from './drawing_queue'

function update(
  designs: CardDesign[],
  positions: CardPosition[],
  visible: Card[],
  flipped: Card[],
  selected: Card[],
  spaceCards: Card[],
  reflections: Reflection[],
  zLevels: ZLevel[],
  getMovements: () => Movements,
): CardToDraw[] {
  let positionsDict: {[card: Card]: CardPosition} = {}
  for (const position of positions) {
    //positionsDict[position.card] = position
  }

  const moves = getMovements()
  for (const card in moves) {
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

  return createDrawingQueue(
    positions,
    designs,
    visible,
    flipped,
    selected,
    spaceCards,
    reflections,
    zLevels
  )
}

// Game state -----
// piles
// selected
//
// Render state -----
// designs
// movements
//
// Calculated -----
// positions
// visible
// flipped
// selected
// spaceCards
// reflections
// zLevels

export function start(
  context: CanvasRenderingContext2D,
  designs: CardDesign[],
  positions: CardPosition[],
  visible: Card[],
  flipped: Card[],
  selected: Card[],
  spaceCards: Card[],
  reflections: Reflection[],
  zLevels: ZLevel[],
  getMovements: () => Movements,
) {
  let animationId: number | undefined
  function loop() {
    const queue = update(
      designs,
      positions,
      visible,
      flipped,
      selected,
      spaceCards,
      reflections,
      zLevels,
      getMovements
    )
    drawCards(context, queue)
    animationId = requestAnimationFrame(loop)
  }

  animationId = requestAnimationFrame(loop)
  return () => {
    if (animationId !== undefined) cancelAnimationFrame(animationId)
  }
}
