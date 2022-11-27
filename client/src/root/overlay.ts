function OverlayElement(innerElement: HTMLElement) {
  const element = document.createElement('div')
  element.style.position = "absolute"
  element.appendChild(innerElement)
  return element
}

export function Overlay(bottomElem: HTMLElement, topElem: HTMLElement) {
  const overlay = document.createElement('div')
  overlay.style.position = "relative"
  overlay.appendChild(OverlayElement(bottomElem))
  overlay.appendChild(OverlayElement(topElem))
  return overlay
}
