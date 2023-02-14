import { Frame, FrameElement } from "./frame"
import { Environment, getEnvironment } from './environment'
import { Stream, StreamSource } from '../stream'
import { Resolution, getResolution } from './resolution'

function getRootElem(): HTMLElement {
  const rootElem = document.getElementById('climate-call')
  if (!rootElem) throw new Error("Can't find element with id 'climate-call'")
  return rootElem
}

export type Root = {
  readonly environment: Environment
  readonly frame: FrameElement
  readonly resolution$: Stream<Resolution>
}

export function createRoot(element: HTMLElement): Root {
  const environment = getEnvironment(element)

  const frame = Frame()

  const resolution$ = new StreamSource<Resolution>(getResolution(element))
  new ResizeObserver(() => resolution$.next(getResolution(element))).observe(element)

  return {
    environment,
    resolution$,
    frame
  } as const
}

export async function mountRoot(): Promise<Root> {
  const element = getRootElem()

  const frame = Frame()
  element.appendChild(frame.element)

  return createRoot(element)

  /*
  const baseFontSize = new BaseFontSize(resolution$)
  element.appendChild(baseFontSize.element)
  */
}
