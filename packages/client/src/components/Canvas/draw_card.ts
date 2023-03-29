import { CardDesign } from '../../core2/card_design'
import { Card, CardPosition, Reflection } from '../../core2/card'
import roundRect from './round_rect'
import { setFont, drawText, wordWrap } from './text'

export const CARD_WIDTH = 256
export const CARD_HEIGHT = 335

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
  flipped: boolean,
  selected: boolean,
  width: number,
  height: number,
  borderRadius: number,
  opacity: number = 1.0
) {
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
    borderRadius,
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
    borderRadius
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
      borderRadius,
      borderRadius
    )
    context.stroke()
    context.lineWidth = 1.0
  }
}

export function drawCard(
  context: CanvasRenderingContext2D,
  position: CardPosition,
  design: CardDesign,
  isSpace: boolean,
  flipped: boolean,
  selected: boolean,
  opacity: number
) {
  const width = CARD_WIDTH
  const height = CARD_HEIGHT
  const borderRadius = 14

  context.translate(position.x, position.y)
  context.rotate(position.rotation)
  context.scale(position.scale, position.scale)
  context.translate(-width/2, -height/2)

  const drawSpaceCard = () => {
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

  if (isSpace) {
    drawSpaceCard()
  } else {
    drawNormalCard(context, design, flipped, selected, width, height, borderRadius, opacity)
  }

  // Reset translation and rotation
  context.translate(width/2, height/2)
  context.scale(1/position.scale, 1/position.scale)
  context.rotate(-position.rotation)
  context.translate(-position.x, -position.y)
}

export const drawCards = (
  context: CanvasRenderingContext2D,
  positions: CardPosition[],
  designs: CardDesign[],
  visible: Card[],
  flipped: Card[],
  selected: Card[],
  spaceCards: Card[],
  reflections: Reflection[]
) => {
  let designDict = {}
  for (const design of designs) {
    designDict[design.card] = design
  }

  const flippedSet = new Set(flipped)
  const visibleSet = new Set(visible)
  const selectedSet = new Set(selected)
  const spaceCardsSet = new Set(spaceCards)
  let opacity = 1.0

  for (const reflection of reflections) {
    const reflectedDesign = designDict[reflection.reflected]
    if (reflectedDesign !== undefined) {
      designDict[reflection.card] = reflectedDesign
      spaceCardsSet.delete(reflection.card)
      opacity = 0.7
    }
  }

  positions = positions.sort((a,b) => a.zLevel - b.zLevel)

  for (const position of positions) {
    const card = position.card
    if (visibleSet.has(card)) {
      const design = designDict[card]
      if (design !== undefined) {
          const flipped = flippedSet.has(card)
          const selected = selectedSet.has(card)
          const isSpace = spaceCardsSet.has(card)
          drawCard(context, position, design, isSpace, flipped, selected, opacity)
      }
    }
  }
}
