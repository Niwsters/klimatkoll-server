// Cheers @ https://stackoverflow.com/questions/2936112/text-wrap-in-a-canvas-element
export function wordWrap(context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
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

export function setFont(
  context: CanvasRenderingContext2D,
  size: number,
  weight: number = 600
) {
  context.font = `${weight} ${size}px Poppins`
}

export function drawText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  textAlign: CanvasTextAlign = 'center'
) {
  context.textAlign = textAlign
  context.fillText(text, x, y)
}
