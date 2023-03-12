import { Card } from '../../core2/card'
import { CardDesign } from '../../core2/card_design'

import { drawCard } from './draw_card'

export type GetCards = () => Card[]
export type GetCardDesign = (name: string) => CardDesign

const dict = <T>(list: T[], param: (item: T) => any) => list.reduce((dict, item) => ({ ...dict, [param(item)]: item }), {})
const equijoin = <T1,T2>(a: T1[], b: T2[], paramA: (a: T1) => any, paramB: (b: T2) => any): (T1 & T2)[] => {
  const dictB = dict(b, paramB)
  return a.map(a => ({
      ...a,
      ...dictB[paramA(a)]
  }))
}

export function render(context: CanvasRenderingContext2D, getCards: GetCards, cardDesigns: CardDesign[]) {
  let previousTimestamp: number = -1

  let animationId: number | undefined
  function draw(timestamp: number) {
    const cards = equijoin(getCards(), cardDesigns, a => a.name, b => b.name)
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
