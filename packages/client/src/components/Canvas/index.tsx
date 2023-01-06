import { CardDesign } from 'core2/card_design'
import React, { useEffect, useRef } from 'react'
import { Card } from 'core2/card'
import { drawCard } from './draw_card'

export const WIDTH = 960
export const HEIGHT = 540
export { CARD_WIDTH, CARD_HEIGHT } from './draw_card'

export type GetCards = () => Card[]
export type GetCardDesign = (name: string) => CardDesign

function render(context: CanvasRenderingContext2D, getCards: GetCards, getCardDesign: GetCardDesign) {
  let previousTimestamp: number = -1

  let animationId: number | undefined
  function draw(timestamp: number) {
    const cards = getCards()
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

function coords(canvas: HTMLCanvasElement, event: MouseEvent): { x: number, y: number } {
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  return { x, y }
}

export type CanvasProps = {
  getCards: GetCards,
  getCardDesign: GetCardDesign,
  onMouseMove?: (x: number, y: number) => void,
  onMouseClicked?: (x: number, y: number) => void
}

export function Component(props: CanvasProps): React.ReactElement {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (canvasRef.current !== null) {
      const canvas = canvasRef.current as HTMLCanvasElement

      canvas.onmousemove = (event: MouseEvent) => {
        const { x, y } = coords(canvas, event)
        if (props.onMouseMove !== undefined)
          props.onMouseMove(x, y)
      }

      canvas.onmousedown = (event: MouseEvent) => {
        const { x, y } = coords(canvas, event)
        if (props.onMouseClicked !== undefined)
          props.onMouseClicked(x, y)
      }

      const context = canvas.getContext('2d')

      if (context !== null) {
        return render(context, props.getCards, props.getCardDesign)
      }
    }
  }, [])

  const style: any = {
    fontFamily: "Poppins"
  }

  return (
    <canvas width={WIDTH} height={HEIGHT} style={style} ref={canvasRef}></canvas>
  )
}
