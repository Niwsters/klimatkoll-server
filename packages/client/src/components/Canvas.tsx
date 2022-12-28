import React, { useEffect, useRef } from 'react'

export type CanvasProps = {

}

type Card = {
  title: string,
  subtitle: string,
  emissions: number,
  descr_front: string,
  descr_back: string,
  duration: string,

  x: number,
  y: number,
  rotation: number
}

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
  context.moveTo(x, y)
  context.arcTo(x+w, y, x+w, y+h, rTop)
  context.arcTo(x+w, y+h, x, y+h, rBottom)
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

function drawCard(context: CanvasRenderingContext2D, card: Card) {
  const width = 256
  const headerHeight = 144
  const footerHeight = 191
  const height = headerHeight + footerHeight
  const borderRadius = 14
  
  context.translate(card.x + width/2, card.y + height/2)
  context.rotate(card.rotation)
  context.translate(-width/2, -height/2)

  // Header background
  context.fillStyle = '#FAD44C'
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


  context.fillStyle = '#1C1C45'

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
  const emissionsY = subtitleY + 36 + 12
  setFont(context, 36)
  drawText(
    context,
    card.emissions.toString() + " KG",
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

  context.stroke()


  // Description
  const fontSize = 18
  const padding = 22
  const descrX = padding
  const descrY = fontSize + headerHeight + padding
  setFont(context, fontSize, 400)

  // Manual word wrapping :DDD
  const lines = wordWrap(context, card.descr_front, width - padding * 2)
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

  // Reset translation and rotation
  context.translate(width/2, height/2)
  context.rotate(-card.rotation)
  context.translate(-card.x-width/2, -card.y-height/2)
}

export function Canvas(props: CanvasProps): React.ReactElement {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas: HTMLCanvasElement | null = canvasRef.current
    if (canvas !== null) {
      const context = (canvas as HTMLCanvasElement).getContext('2d')

      if (context !== null) {
        context.fillStyle = '#ccc'
        context.fillRect(0, 0, context.canvas.width, context.canvas.height)

        const card: Card = {
          title: "Bilresa",
          subtitle: "Stockholm - Göteborg",
          emissions: 80,
          descr_front: "En tur och retur-resa på sammanlagt 900 km med två personer i en medelstor dieselbil",
          descr_back: "En tur och retur-resa på sammanlagt 900 km med två personer i en medelstor dieselbil",
          duration: "1 dag",
          x: 100,
          y: 100,
          rotation: Math.PI / 4
        }

        const card2: Card = {
          title: "Bilresa",
          subtitle: "Stockholm - Göteborg",
          emissions: 80,
          descr_front: "En tur och retur-resa på sammanlagt 900 km med två personer i en medelstor dieselbil",
          descr_back: "En tur och retur-resa på sammanlagt 900 km med två personer i en medelstor dieselbil",
          duration: "1 dag",
          x: 400,
          y: 100,
          rotation: -Math.PI/6
        }

        drawCard(context, card)
        drawCard(context, card2)
      }
    }
  })

  const style: any = {
    "font-family": "Poppins"
  }

  return (
    <canvas width={800} height={600} style={style} ref={canvasRef} {...props}></canvas>
  )
}
