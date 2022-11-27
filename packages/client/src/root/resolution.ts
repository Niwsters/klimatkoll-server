function scalePixelRatio(pixels: number) {
  return pixels * window.devicePixelRatio
}

function desiredWidth(element: HTMLElement): number {
  const viewportWidth = element.clientWidth
  const viewportHeight = element.clientHeight
  if (viewportHeight / viewportWidth < 0.5625)
    return scalePixelRatio(viewportHeight) / 0.5625;

  return scalePixelRatio(viewportWidth);
}

function desiredHeight(element: HTMLElement): number {
  return desiredWidth(element) * 0.5625
}

export type Resolution = {
  width: number,
  height: number
}

export function getResolution(rootElement: HTMLElement): Resolution {
  return { width: desiredWidth(rootElement), height: desiredHeight(rootElement) }
}
