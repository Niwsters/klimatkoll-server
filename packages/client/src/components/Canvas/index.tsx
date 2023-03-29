import { Card, CardPosition, Reflection } from 'core2/card'
import { CardDesign } from 'core2/card_design'
import { Moves } from 'core2/move'
import React, { useEffect, useRef } from 'react'
import { render } from './render'

export const WIDTH = 960
export const HEIGHT = 540
export { CARD_WIDTH, CARD_HEIGHT } from './draw_card'

function coords(canvas: HTMLCanvasElement, event: MouseEvent): { x: number, y: number } {
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  return { x, y }
}

export type CanvasProps = {
  getCards: () => Card[],
  getPositions: () => CardPosition[],
  getVisible: () => Card[],
  getFlipped: () => Card[],
  getSelected: () => Card[],
  getAnimations: () => Animation[],
  getSpaceCards: () => Card[],
  getReflections: () => Reflection[],
  getMoves: () => Moves,
  designs: CardDesign[],
  onMouseMove?: (x: number, y: number) => void,
  onMouseClicked?: (x: number, y: number) => void
}

export function Component(props: CanvasProps): React.ReactElement {
  const {
    getPositions,
    getVisible,
    getFlipped,
    getSelected,
    getSpaceCards,
    getReflections,
    getMoves,
    designs
  } = props

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
        return render(
          context,
          designs,
          getPositions(),
          getVisible(),
          getFlipped(),
          getSelected(),
          getSpaceCards(),
          getReflections(),
          getMoves()
        )
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
