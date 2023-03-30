import { Card, CardPosition, Reflection, ZLevel } from '../core2/card'
import { CardDesign } from '../core2/card_design'
import { initMovements, Movements } from '../core2/move'
import React, { useEffect, useRef } from 'react'
import { start } from '../core2/loop'
import { WIDTH, HEIGHT } from '../core2/constants'

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
  getMovements: (moves: Movements, mouseX: number, mouseY: number) => Movements,
  designs: CardDesign[],
  onMouseMovement?: (x: number, y: number) => void,
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
    getMovements,
    designs
  } = props

  const canvasRef = useRef(null)

  let moves = initMovements(getVisible())

  useEffect(() => {
    let mouseX = 0
    let mouseY = 0

    if (canvasRef.current !== null) {
      const canvas = canvasRef.current as HTMLCanvasElement

      canvas.onmousemove = (event: MouseEvent) => {
        const { x, y } = coords(canvas, event)
        mouseX = x
        mouseY = y
        if (props.onMouseMovement !== undefined)
          props.onMouseMovement(x, y)
      }

      canvas.onmousedown = (event: MouseEvent) => {
        const { x, y } = coords(canvas, event)
        if (props.onMouseClicked !== undefined)
          props.onMouseClicked(x, y)
      }

      const context = canvas.getContext('2d')

      if (context !== null) {
        return start(
          context,
          designs,
          getPositions(),
          getVisible(),
          getFlipped(),
          getSelected(),
          getSpaceCards(),
          getReflections(),
          getZLevels(),
          () => getMovements(moves, mouseX, mouseY)
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
