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
import { PlayedCard, playedCards as getPlayedCards } from './play_card'

function update(
  moves: Movements,
  hand: Card[],
  emissionsLine: Card[],
  selected: Card[],
  mouse: MousePosition,
  mouseClickedEvents: MouseClickedEvent[],
  currentTime: number
): [Card[], Movements, Reflection[], CardToDraw[], PlayedCard[]] {
  const spaceCards: Card[] = getSpaceCards(emissionsLine)
  moves = getMovements(moves, hand, emissionsLine, spaceCards, mouse.x, mouse.y, currentTime)

  const playedCards = getPlayedCards(mouseClickedEvents, selected, spaceCards)
  selected = getSelected(selected, hand, mouseClickedEvents)

  const positions = getPositions(moves)
  let visible = [...hand, ...emissionsLine]
  if (selected.length > 0) {
    visible = [...visible, ...spaceCards]
  }
  const flipped = emissionsLine

  const queue = createDrawingQueue(
    positions,
    visible,
    flipped,
    selected,
    spaceCards,
    zLevels(hand, emissionsLine, spaceCards)
  )

  return [
    selected,
    moves,
    reflections(selected, spaceCards, mouse.x, mouse.y),
    queue,
    playedCards
  ]
}

export function start(
  context: CanvasRenderingContext2D,
  designs: CardDesign[],
  getHand: () => Card[],
  getEmissionsLine: () => Card[],
  getMousePosition: () => MousePosition,
  getMouseClickedEvents: () => MouseClickedEvent[],
  onCardsPlayed: (playedCards: PlayedCard[]) => void
) {
  let animationId: number | undefined
  let moves: Movements = initMovements([...getHand(), ...getEmissionsLine()])
  let selected: Card[] = []
  function loop() {
    let queue: CardToDraw[] = [];
    let reflections: Reflection[] = [];
    let playedCards: PlayedCard[] = [];
    [selected, moves, reflections, queue, playedCards] = update(
      moves,
      getHand(),
      getEmissionsLine(),
      selected,
      getMousePosition(),
      getMouseClickedEvents(),
      Date.now()
    )
    onCardsPlayed(playedCards)
    drawCards(context, designs, reflections, queue)
    animationId = requestAnimationFrame(loop)
  }

  animationId = requestAnimationFrame(loop)
  return () => {
    if (animationId !== undefined) cancelAnimationFrame(animationId)
  }
}
