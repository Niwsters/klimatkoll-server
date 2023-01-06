export default function roundRect(
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
