import React, { useEffect, useRef } from 'react'

export type CanvasProps = {

}

export function Canvas(props: CanvasProps): React.ReactElement {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas: HTMLCanvasElement | null = canvasRef.current
    if (canvas !== null) {
      const context = (canvas as HTMLCanvasElement).getContext('2d')

      if (context !== null) {
        context.fillStyle = '#000000'
        context.fillRect(0, 0, context.canvas.width, context.canvas.height)
      }
    }
  })

  return (
    <canvas ref={canvasRef} {...props}></canvas>
  )
}
