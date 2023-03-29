import { Card, CardPosition, Reflection, ZLevel } from '../../core2/card'
import { CardDesign } from '../../core2/card_design'
import { initMoves, Moves } from '../../core2/move'
import React, { useEffect, useRef } from 'react'
import { render } from './render'
import { WIDTH, HEIGHT } from '../../core2/constants'

function coords(canvas: HTMLCanvasElement, event: MouseEvent): { x: number, y: number } {
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  return { x, y }
}

export type CanvasProps = {
  getPositions: () => CardPosition[],
  getZLevels: () => ZLevel[],
  getVisible: () => Card[],
  getFlipped: () => Card[],
  getSelected: () => Card[],
  getSpaceCards: () => Card[],
  getReflections: () => Reflection[],
  getMoves: (moves: Moves) => Moves,
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
    getZLevels,
    getMoves,
    designs
  } = props

  const canvasRef = useRef(null)

  let moves = initMoves(getVisible())

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
          getZLevels(),
          getMoves(moves)
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
