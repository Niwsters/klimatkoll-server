import React, { useEffect, useRef } from 'react'
import * as Core from '../core2/card'

export type CanvasCardProps = {
  x: number,
  y: number,
  rotation: number,
  scale: number,
  zLevel: number,
}

export type Card = Core.Card & CanvasCardProps

export const WIDTH = 960
export const HEIGHT = 540
export const CARD_WIDTH = 256
export const CARD_HEIGHT = 335

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  rTop: number,
  rBottom: number
) {
  if (w < 2 * rTop) rTop = w / 2;
  if (h < 2 * rTop) rTop = h / 2;
  if (w < 2 * rBottom) rBottom = w / 2;
  if (h < 2 * rBottom) rBottom = h / 2;

  context.beginPath()
  context.moveTo(x+rTop, y)
  context.arcTo(x+w, y,   x+w, y+h, rTop)
  context.arcTo(x+w, y+h, x,   y+h, rBottom)
  context.arcTo(x,   y+h, x,   y,   rBottom)
  context.arcTo(x,   y,   x+w, y,   rTop)
  context.closePath()
}

// Cheers @ https://stackoverflow.com/questions/2936112/text-wrap-in-a-canvas-element
function wordWrap(context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  var words = text.split(" ");
  var lines: string[] = [];

  if (words.length == 0)
    return []

  var currentLine = words[0];
  for (const word of words.slice(1)) {
    var width = context.measureText(currentLine + " " + word).width
    if (width < maxWidth) {
      currentLine += " " + word
    } else {
      lines.push(currentLine)
      currentLine = word
    }
  }
  lines.push(currentLine)

  return lines;
}

function setFont(
  context: CanvasRenderingContext2D,
  size: number,
  weight: number = 600
) {
  context.font = `${weight} ${size}px Poppins`
}

function drawText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  textAlign: CanvasTextAlign = 'center'
) {
  context.textAlign = textAlign
  context.fillText(text, x, y)
}

function formatEmissions(n: number): string {
  let n_str = n.toString().split("").reverse().join("")
  let str = ""
  const splits = Math.ceil(n_str.length / 3)

  for (let i=0; i<(splits + 1); i++) {
    str += n_str.slice(i*3, i*3+3) + " "
  }

  return str.trim().split("").reverse().join("") + " KG"
}

function drawNormalCard(
  context: CanvasRenderingContext2D,
  card: Card,
  width: number,
  height: number,
  borderRadius: number
) {
  const headerHeight = 144
  const footerHeight = CARD_HEIGHT - headerHeight

  // Header background
  const header_bg = card.flipped ? card.bg_color_back : card.bg_color_front
  context.fillStyle = header_bg
  roundRect(
    context,
    0,
    0,
    width,
    headerHeight,
    borderRadius,
    0
  )
  context.fill()

  // Footer background
  context.fillStyle = '#F3EFEC'
  roundRect(
    context,
    0,
    headerHeight,
    width,
    footerHeight,
    0,
    borderRadius
  )
  context.fill()

  // Header font color
  context.fillStyle = card.flipped ? '#1C1C45' : '#F3EFEC'

  // Title
  const titleY = 28 + 16
  setFont(context, 28)
  drawText(
    context,
    card.title.toUpperCase(),
    width / 2,
    titleY
  )

  // Subtitle
  const subtitleY = titleY + 16 + 8
  setFont(context, 16)
  drawText(
    context,
    card.subtitle,
    width / 2,
    subtitleY
  )

  // Emissions
  if (card.flipped) {
    const emissionsY = subtitleY + 36 + 12
    setFont(context, 36)
    drawText(
      context,
      formatEmissions(card.emissions),
      width / 2,
      emissionsY
    )

    // Lines next to emissions
    const lineY = emissionsY - 12
    context.beginPath()

    context.moveTo(1, lineY)
    context.lineTo(1 + 30, lineY)

    context.moveTo(width - 1, lineY)
    context.lineTo(width - 1 - 30, lineY)

    context.lineWidth = 1.5
    context.stroke()
    context.lineWidth = 1.0
  }

  // Footer font color
  context.fillStyle = '#1C1C45'

  // Description
  const fontSize = 18
  const padding = 22
  const descrX = padding
  const descrY = fontSize + headerHeight + padding
  setFont(context, fontSize, 400)

  // Manual word wrapping :DDD
  const descr = card.flipped ? card.descr_back : card.descr_front
  const lines = wordWrap(context, descr, width - padding * 2)
  for (let i=0; i<lines.length; i++) {
    drawText(
      context,
      lines[i],
      descrX,
      descrY + (fontSize + 8) * i,
      'left'
    )
  }

  // Duration
  setFont(context, 14)
  drawText(
    context,
    card.duration,
    width - padding,
    height - padding,
    'right'
  )

  // Selected card border
  if (card.selected === true) {
    context.strokeStyle = "#17a2b8"
    context.lineWidth = 8.0
    roundRect(
      context,
      0,
      0,
      width,
      height,
      borderRadius,
      borderRadius
    )
    context.stroke()
    context.lineWidth = 1.0
  }
}

function drawSpaceCard(context: CanvasRenderingContext2D, card: Card, width: number, height: number, borderRadius: number) {
  if (!card.visible) return

  context.fillStyle = 'rgba(0, 0, 0, 0.3)'
  roundRect(
    context,
    0,
    0,
    width,
    height,
    borderRadius,
    borderRadius
  )
  context.fill()
}

function drawCard(context: CanvasRenderingContext2D, card: Card) {
  const width = CARD_WIDTH
  const height = CARD_HEIGHT
  const borderRadius = 14

  context.translate(card.x, card.y)
  context.rotate(card.rotation)
  context.scale(card.scale, card.scale)
  context.translate(-width/2, -height/2)

  if (card.isSpace) {
    drawSpaceCard(context, card, width, height, borderRadius)
  } else {
    drawNormalCard(context, card, width, height, borderRadius)
  }

  // Reset translation and rotation
  context.translate(width/2, height/2)
  context.scale(1/card.scale, 1/card.scale)
  context.rotate(-card.rotation)
  context.translate(-card.x, -card.y)
}

function render(context: CanvasRenderingContext2D, getCards: (timestamp: number) => Card[]) {
  let previousTimestamp: number = -1

  let animationId: number | undefined
  function draw(timestamp: number) {
    const cards = getCards(timestamp).sort((a, b) => a.zLevel - b.zLevel)

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


export type CanvasProps = {
  getCards: (timestamp: number) => Card[],
  onMouseMove?: (x: number, y: number) => void,
  onMouseClicked?: (x: number, y: number) => void
}

export function Component(props: CanvasProps): React.ReactElement {
  const canvasRef = useRef(null)

  useEffect(() => {
    let canvas: HTMLCanvasElement | null = canvasRef.current
    if (canvas !== null) {
      canvas = canvas as HTMLCanvasElement

      canvas.onmousemove = (event: MouseEvent) => {
        if (props.onMouseMove !== undefined)
          props.onMouseMove(event.clientX, event.clientY)
      }

      canvas.onmousedown = (event: MouseEvent) => {
        if (props.onMouseClicked !== undefined)
          props.onMouseClicked(event.clientX, event.clientY)
      }

      const context = canvas.getContext('2d')

      if (context !== null) {
        return render(context, props.getCards)
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
