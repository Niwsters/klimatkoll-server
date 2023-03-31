import { CardDesign } from './card_design'
import { Card, Reflection } from './card'
import { CARD_WIDTH, CARD_HEIGHT, BORDER_RADIUS, WIDTH, HEIGHT, REFLECTION_OPACITY } from './constants'
import { dict } from './util';
import { CardPosition } from './position';

export type CardToDraw = {
  card: Card,
  position: CardPosition
  isSpace: boolean
  flipped: boolean
  selected: boolean
  opacity: number
}

// Cheers @ https://stackoverflow.com/questions/2936112/text-wrap-in-a-canvas-element
function wordWrap(context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  var words = text.split(" ");
  var lines: string[] = [];

  if (words.length == 0)
    return []

  var currentLine: string = words[0] || "";
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

function formatEmissions(n: number): string {
  let n_str = n.toString().split("").reverse().join("")
  let str = ""
  const splits = Math.ceil(n_str.length / 3)

  for (let i=0; i<(splits + 1); i++) {
    str += n_str.slice(i*3, i*3+3) + " "
  }

  return str.trim().split("").reverse().join("") + " KG"
}

function opacityHex(opacity: number): string {
  const hex = Math.round(opacity*255).toString(16)
  if (hex.length === 1)
    return '0' + hex
  return hex
}

function colorHex(color: string, opacity: number): string {
  return color + opacityHex(opacity)
}

function drawNormalCard(
  context: CanvasRenderingContext2D,
  design: CardDesign,
  card: CardToDraw
) {
  const { flipped, selected, opacity } = card
  const width = CARD_WIDTH
  const height = CARD_HEIGHT
  const headerHeight = 144
  const footerHeight = CARD_HEIGHT - headerHeight
  const darkBlue = colorHex('#1C1C45', opacity)
  const lightGrey = colorHex('#F3EFEC', opacity)
  const backFontColor = (bg_color_back: string): string => bg_color_back === "#265157" ? lightGrey : darkBlue

  // Header background
  const header_bg = flipped ? colorHex(design.bg_color_back, opacity) : colorHex(design.bg_color_front, opacity)
  context.fillStyle = header_bg
  roundRect(
    context,
    0,
    0,
    width,
    headerHeight,
    BORDER_RADIUS,
    0
  )
  context.fill()

  // Footer background
  context.fillStyle = lightGrey
  roundRect(
    context,
    0,
    headerHeight,
    width,
    footerHeight,
    0,
    BORDER_RADIUS
  )
  context.fill()

  const headerFontColor = flipped ? backFontColor(design.bg_color_back) : lightGrey
  context.fillStyle = headerFontColor
  context.strokeStyle = headerFontColor

  // Title
  const titleY = 28 + 16
  setFont(context, 28)
  drawText(
    context,
    design.title.toUpperCase(),
    width / 2,
    titleY
  )

  // Subtitle
  const subtitleY = titleY + 16 + 8
  setFont(context, 16)
  drawText(
    context,
    design.subtitle,
    width / 2,
    subtitleY
  )

  // Emissions
  if (flipped) {
    const emissionsY = subtitleY + 36 + 12
    setFont(context, 36)
    drawText(
      context,
      formatEmissions(design.emissions),
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
  context.fillStyle = darkBlue

  // Description
  const fontSize = 18
  const padding = 22
  const descrX = padding
  const descrY = fontSize + headerHeight + padding
  setFont(context, fontSize, 400)

  // Manual word wrapping :DDD
  const descr = flipped ? design.descr_back : design.descr_front
  const lines = wordWrap(context, descr, width - padding * 2)
  lines.forEach((line, index) => {
    drawText(
      context,
      line,
      descrX,
      descrY + (fontSize + 8) * index,
      'left'
    )
  })

  // Duration
  setFont(context, 14)
  drawText(
    context,
    design.duration,
    width - padding,
    height - padding,
    'right'
  )

  // Selected card border
  if (selected === true) {
    context.strokeStyle = colorHex('#17a2b8', opacity)
    context.lineWidth = 8.0
    roundRect(
      context,
      0,
      0,
      width,
      height,
      BORDER_RADIUS,
      BORDER_RADIUS
    )
    context.stroke()
    context.lineWidth = 1.0
  }
}


const drawSpaceCard = (context: CanvasRenderingContext2D) => {
  context.fillStyle = 'rgba(0, 0, 0, 0.3)'
  roundRect(
    context,
    0,
    0,
    CARD_WIDTH,
    CARD_HEIGHT,
    BORDER_RADIUS,
    BORDER_RADIUS
  )
  context.fill()
}

const setPosition = (context: CanvasRenderingContext2D, position: CardPosition) => {
  const width = CARD_WIDTH
  const height = CARD_HEIGHT
  context.translate(position.x, position.y)
  context.rotate(position.rotation)
  context.scale(position.scale, position.scale)
  context.translate(-width/2, -height/2)
}

const reset = (context: CanvasRenderingContext2D, position: CardPosition) => {
  const width = CARD_WIDTH
  const height = CARD_HEIGHT
  context.translate(width/2, height/2)
  context.scale(1/position.scale, 1/position.scale)
  context.rotate(-position.rotation)
  context.translate(-position.x, -position.y)
}

export const drawCards = (
  context: CanvasRenderingContext2D,
  designs: CardDesign[],
  reflections: Reflection[],
  cards: CardToDraw[]
) => {
  context.fillStyle = '#ccc'
  context.fillRect(0, 0, WIDTH, HEIGHT)

  const designDict = dict(designs, d => d.card)
  const reflectionsDict = dict(reflections, r => r.card)

  for (const card of cards) {
    setPosition(context, card.position)

    if (card.isSpace) {
      const reflection = reflectionsDict[card.card]
      if (reflection === undefined) {
        drawSpaceCard(context)
      } else {
        const design = designDict[reflection.reflected]
        if (design !== undefined) {
          drawNormalCard(context, design, { ...card, opacity: REFLECTION_OPACITY })
        }
      }
    } else {
      const design = designDict[card.card]
      if (design !== undefined) {
        drawNormalCard(context, design, card)
      }
    }
    reset(context, card.position)
  }
}
