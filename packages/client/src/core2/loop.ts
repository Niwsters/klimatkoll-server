import { getMovements, initMovements, Movements } from './move'
import { Card, CardPosition, Reflection, ZLevel } from './card'
import { CardDesign } from './card_design'

import { CardToDraw, drawCards } from './draw_card'
import { transpose } from './transition'
import { createDrawingQueue } from './drawing_queue'

function update(
  moves: Movements,
  hand: Card[],
  emissionsLine: Card[],
  mouseX: number,
  mouseY: number,
  currentTime: number,
  designs: CardDesign[],
  positions: CardPosition[],
  visible: Card[],
  flipped: Card[],
  selected: Card[],
  spaceCards: Card[],
  reflections: Reflection[],
  zLevels: ZLevel[]
): [Movements, CardToDraw[]] {
  let positionsDict: {[card: Card]: CardPosition} = {}
  moves = getMovements(moves, hand, emissionsLine, mouseX, mouseY, currentTime)
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

  positions = Object.values(positionsDict)

  const queue = createDrawingQueue(
    positions,
    designs,
    visible,
    flipped,
    selected,
    spaceCards,
    reflections,
    zLevels
  )

  return [moves, queue]
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
  getHand: () => Card[],
  getEmissionsLine: () => Card[],
  getMousePosition: () => [number, number]
) {
  let animationId: number | undefined
  let moves: Movements = initMovements([...getHand(), ...getEmissionsLine()])
  function loop() {
    let queue: CardToDraw[] = [];
    const [mouseX, mouseY] = getMousePosition();
    [moves, queue] = update(
      moves,
      getHand(),
      getEmissionsLine(),
      mouseX,
      mouseY,
      Date.now(),
      designs,
      positions,
      visible,
      flipped,
      selected,
      spaceCards,
      reflections,
      zLevels
    )
    drawCards(context, queue)
    animationId = requestAnimationFrame(loop)
  }

  animationId = requestAnimationFrame(loop)
  return () => {
    if (animationId !== undefined) cancelAnimationFrame(animationId)
  }
}
