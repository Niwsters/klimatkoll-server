import { Card } from '../../core2/card'
import { CardDesign } from '../../core2/card_design'

import { drawCard } from './draw_card'

export type GetCards = () => Card[]
export type GetCardDesign = (name: string) => CardDesign

const dict = (list: any[], param: string) => list.reduce((dict, item) => ({ ...dict, [item[param]]: item }), {})

const equijoin = <T1,T2>(a: T1[], b: T2[], param: string): (T1 & T2)[] => {
  const dictB = dict(b, param)
  return a.map(a => ({
      ...a,
      ...dictB[a[param]]
  }))
}

export function render(context: CanvasRenderingContext2D, getCards: GetCards, cardDesigns: CardDesign[]) {
  let previousTimestamp: number = -1

  let animationId: number | undefined
  function draw(timestamp: number) {
    const cards = equijoin(getCards(), cardDesigns, "name")
      .filter(c => c.visible === true)
      .sort((a, b) => a.zLevel - b.zLevel)

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
