import { Card } from '../core2/card'
import { CardDesign } from '../core2/card_design'
import React, { useEffect, useRef } from 'react'
import { start } from '../core2/loop'
import { WIDTH, HEIGHT } from '../core2/constants'
import { MouseClickedEvent } from 'core2/mouse'

function coords(canvas: HTMLCanvasElement, event: MouseEvent): { x: number, y: number } {
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  return { x, y }
}

export type Props = {
  designs: CardDesign[],
  getHand: () => Card[],
  getEmissionsLine: () => Card[]
}

export function Canvas(props: Props): React.ReactElement {
  const {
    getHand,
    getEmissionsLine,
    designs
  } = props

  const canvasRef = useRef(null)

  useEffect(() => {
    let mouseX = 0
    let mouseY = 0

    let mouseClickedEvents: MouseClickedEvent[] = []
    const getMouseClickedEvents = () => {
      const events = [...mouseClickedEvents]
      mouseClickedEvents = []
      return events
    }

    const getMousePosition = () => ({
      x: mouseX,
      y: mouseY
    })

    if (canvasRef.current !== null) {
      const canvas = canvasRef.current as HTMLCanvasElement

      canvas.onmousemove = (event: MouseEvent) => {
        const { x, y } = coords(canvas, event)
        mouseX = x
        mouseY = y
      }

      canvas.onmousedown = (event: MouseEvent) => {
        const { x, y } = coords(canvas, event)
        mouseClickedEvents.push({ x, y })
      }

      const context = canvas.getContext('2d')

      if (context !== null) {
        return start(
          context,
          designs,
          getHand,
          getEmissionsLine,
          getMousePosition,
          getMouseClickedEvents
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
