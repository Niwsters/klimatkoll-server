import { Card } from '../../core2/card'
import { CardDesign } from '../../core2/card_design'

import { drawCard } from './draw_card'

export type GetCards = () => Card[]
export type GetCardDesign = (name: string) => CardDesign

export function render(context: CanvasRenderingContext2D, getCards: GetCards, getCardDesign: GetCardDesign) {
  let previousTimestamp: number = -1

  let animationId: number | undefined
  function draw(timestamp: number) {
    const cards = getCards()
      .filter(c => c.visible === true)
      .sort((a, b) => a.zLevel - b.zLevel)
      .map(card => {
        return {
          ...card,
          ...getCardDesign(card.name)
        }
      })

    if (previousTimestamp === -1)
      previousTimestamp = timestamp

    context.fillStyle = '#ccc'
    context.fillRect(0, 0, context.canvas.width, context.canvas.height)
    cards.forEach(card => drawCard(context, card))

    animationId = requestAnimationFrame(draw)
  }

  animationId = requestAnimationFrame(draw)
  return () => {
    if (animationId !== undefined) cancelAnimationFrame(animationId)
  }
}
