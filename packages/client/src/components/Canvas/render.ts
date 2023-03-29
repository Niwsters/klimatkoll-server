import { Card, CardPosition } from '../../core2/card'
import { CardDesign } from '../../core2/card_design'
import { Animation, animate } from 'core2/animation'

import { drawCards } from './draw_card'

export type GetCards = () => Card[]
export type GetCardDesign = (name: string) => CardDesign
export type GetAnimations = () => Animation[]

export function render(
  context: CanvasRenderingContext2D,
  designs: CardDesign[],
  positions: CardPosition[],
  visible: Card[]
) {
  let previousTimestamp: number = -1

  let animationId: number | undefined
  function draw(timestamp: number) {
    context.fillStyle = '#ccc'
    context.fillRect(0, 0, context.canvas.width, context.canvas.height)

    if (previousTimestamp === -1)
      previousTimestamp = timestamp

    drawCards(context, positions, designs, visible)

    /*
    const cards = equijoin(getCards(), cardDesigns, a => a.name, b => b.name)
      .filter(c => c.visible === true)
      .sort((a, b) => a.zLevel - b.zLevel)



    const animations = getAnimations()
    const positions = animate(animations, Date.now())

    cards.forEach(card => drawCard(context, position, design, isSpace, flipped, selected))
    */

    animationId = requestAnimationFrame(draw)
  }

  animationId = requestAnimationFrame(draw)
  return () => {
    if (animationId !== undefined) cancelAnimationFrame(animationId)
  }
}
