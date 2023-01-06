import { CardDesign } from '../../core2/card_design'
import { Card as CoreCard } from '../../core2/card'
import roundRect from './round_rect'
import { setFont, drawText, wordWrap } from './text'

export const CARD_WIDTH = 256
export const CARD_HEIGHT = 335

export type Card = CoreCard & CardDesign

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

  const headerFontColor = card.flipped ? '#1C1C45' : '#F3EFEC'
  context.fillStyle = headerFontColor
  context.strokeStyle = headerFontColor

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

export function drawCard(context: CanvasRenderingContext2D, card: Card) {
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
