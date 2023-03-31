import { getMovements, initMovements, Movements } from './move'
import { Card, Reflection } from './card'
import { zLevels } from './z_levels'
import { CardDesign } from './card_design'
import { CardToDraw, drawCards } from './draw_card'
import { createDrawingQueue } from './drawing_queue'
import { getSelected } from './select'
import { getSpaceCards } from './emissions_line'
import { reflections } from './reflection'
import { positions as getPositions } from './position'
import { MouseClickedEvent, MousePosition } from './mouse'

function update(
  moves: Movements,
  hand: Card[],
  emissionsLine: Card[],
  selected: Card[],
  mouse: MousePosition,
  mouseClickedEvents: MouseClickedEvent[],
  currentTime: number
): [Card[], Movements, Reflection[], CardToDraw[]] {


  const spaceCards: Card[] = getSpaceCards(emissionsLine)
  moves = getMovements(moves, hand, emissionsLine, spaceCards, mouse.x, mouse.y, currentTime)

  const positions = getPositions(moves)
  for (const _ of mouseClickedEvents) {
    selected = getSelected(hand, mouse.x, mouse.y)
  }
  const cards = positions.map(p => p.card)
  const visible = cards
  const flipped = emissionsLine

  const queue = createDrawingQueue(
    positions,
    visible,
    flipped,
    selected,
    spaceCards,
    zLevels(hand, emissionsLine, spaceCards)
  )

  return [selected, moves, reflections(selected, spaceCards, positions, mouse.x, mouse.y), queue]
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
  getMousePosition: () => MousePosition,
  getMouseClickedEvents: () => MouseClickedEvent[]
) {
  let animationId: number | undefined
  let moves: Movements = initMovements([...getHand(), ...getEmissionsLine()])
  let selected: Card[] = []
  function loop() {
    let queue: CardToDraw[] = [];
    let reflections: Reflection[] = [];
    [selected, moves, reflections, queue] = update(
      moves,
      getHand(),
      getEmissionsLine(),
      selected,
      getMousePosition(),
      getMouseClickedEvents(),
      Date.now()
    )
    drawCards(context, designs, reflections, queue)
    animationId = requestAnimationFrame(loop)
  }

  animationId = requestAnimationFrame(loop)
  return () => {
    if (animationId !== undefined) cancelAnimationFrame(animationId)
  }
}
