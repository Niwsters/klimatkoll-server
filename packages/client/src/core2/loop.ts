import { getMovements, initMovements, Movements } from './move'
import { Card, CardPosition, Reflection } from './card'
import { ZLevel, zLevels } from './z_levels'
import { CardDesign } from './card_design'
import { CardToDraw, drawCards } from './draw_card'
import { transpose } from './transition'
import { createDrawingQueue } from './drawing_queue'

function update(
  designs: CardDesign[],
  moves: Movements,
  hand: Card[],
  emissionsLine: Card[],
  mouseX: number,
  mouseY: number,
  currentTime: number
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

  const positions = Object.values(positionsDict)

  const cards = positions.map(p => p.card)
  const visible = cards
  const flipped = emissionsLine
  const selected: Card[] = []
  const spaceCards: Card[] = []
  const reflections: Reflection[] = []
  const queue = createDrawingQueue(
    positions,
    designs,
    visible,
    flipped,
    selected,
    spaceCards,
    reflections,
    zLevels(hand)
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
  getHand: () => Card[],
  getEmissionsLine: () => Card[],
  getMousePosition: () => [number, number]
) {
  let animationId: number | undefined
  let moves: Movements = initMovements([...getHand(), ...getEmissionsLine()])
  function loop() {
    let queue: CardToDraw[] = [];
    const [mouseX, mouseY] = getMousePosition();
    const hand = getHand();
    const emissionsLine = getEmissionsLine();
    [moves, queue] = update(
      designs,
      moves,
      hand,
      emissionsLine,
      mouseX,
      mouseY,
      Date.now()
    )
    drawCards(context, queue)
    animationId = requestAnimationFrame(loop)
  }

  animationId = requestAnimationFrame(loop)
  return () => {
    if (animationId !== undefined) cancelAnimationFrame(animationId)
  }
}
