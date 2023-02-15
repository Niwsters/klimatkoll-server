import { Stream } from "../stream"
import { Resolution } from "./resolution"

export class BaseFontSize {
  readonly element: HTMLStyleElement

  constructor(resolution$: Stream<Resolution>) {
    const element = document.createElement('style')
    element.innerText = "#app { font-size: 2.1vw; }"
    this.element = element

    resolution$.subscribe(resolution => this.resize(resolution.width))
  }

  private resize(appWidth: number) {
    this.element.innerText = `#app { font-size: ${0.021 * appWidth}px }`
  }
}
