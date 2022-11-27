import { Overlay } from './overlay'

function UIElem() {
  const uiElem = document.createElement('div')
  return uiElem
}

function CanvasElem() {
  const canvasElem = document.createElement('canvas')
  canvasElem.style.display = "block" // Fixes bottom margin issue with HTML Canvas element
  return canvasElem
}

export type FrameElement = {
  element: HTMLElement,
  canvasElem: HTMLCanvasElement
  uiElem: HTMLElement
}

export function Frame(): FrameElement {
  const element = document.createElement('div')
  element.id = "app"
  element.style.width = "100%"
  element.style.height = "100%"
  const canvasElem = CanvasElem()
  const uiElem = UIElem()
  element.appendChild(
    Overlay(
      canvasElem,
      uiElem
    )
  )
 
  return {
    element,
    canvasElem,
    uiElem
  }
}
