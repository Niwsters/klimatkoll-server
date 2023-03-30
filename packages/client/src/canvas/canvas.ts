import { ICard, CardData } from '@shared/models'
import { CardSprite } from './card-sprite'
import { EventToAdd, mouseMovementdEvent, mouseClickedEvent } from '../event/event'
import { StreamChannel } from '../stream'
import { fetchCardData } from 'shared/fetch-card-data'

export class Canvas {
  gl: WebGLRenderingContext
  events$: StreamChannel<EventToAdd> = new StreamChannel()
  cardSprites: CardSprite[] = []
  canvas: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl")
    if (!gl) throw new Error("gl is null")

    const ratio = window.devicePixelRatio; // Changes on browser/OS zoom
    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerWidth * 0.5625 * ratio; // 540 / 960 = 0.5625
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    canvas.addEventListener('mousemove', (e: MouseEvent) => {
      const ratio = 960 / canvas.width * window.devicePixelRatio
      this.events$.next(mouseMovementdEvent(e.clientX * ratio, e.clientY * ratio))
    }, false)

    canvas.addEventListener('click', (e: MouseEvent) => {
      this.events$.next(mouseClickedEvent(e.clientX, e.clientY))
    }, false)

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    this.gl = gl
    this.canvas = canvas
  }

  resize(width: number, height: number) {
    const gl = this.gl
    const canvas = this.canvas

    canvas.width = width
    canvas.height = height
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  }

  prepare(baseUrl: string): void {
    fetchCardData(baseUrl)
      .then((cards: CardData[]) => {
        cards = cards.map((c: CardData, i: number) => {
          return {
            ...c,
            id: i.toString()
          }
        })

        CardSprite.prepareTextures(this.gl, cards, baseUrl)
      })
  }

  render(cards: ICard[]) {
    const gl = this.gl
    let cardSprites = this.cardSprites

    gl.clearColor(1, 1, 1, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)

    // Map new cards to card sprites
    cards
      .forEach((card: ICard) => {
        let sprite = cardSprites.find((s: CardSprite) => s.card.id === card.id)

        if (!sprite) {
          sprite = new CardSprite(gl, card)
          cardSprites.push(sprite)
        } else {
          // Update card data
          sprite.card = card
          const texture = CardSprite.textures.get(card.name)
          if (!texture) throw new Error("Could not find texture with name '" + card.name + "'")
          sprite.texture = texture
        }
      })

    // Remove card sprites that don't exist in gamestate
    cardSprites
      .filter(s => cards.find(c => c.id === s.card.id) === undefined)
      .forEach((s: CardSprite) => {
        CardSprite.delete(s, gl)        
      })
    cardSprites = cardSprites
      .filter(s => cards.find(c => c.id === s.card.id))

    cardSprites
      .sort((a,b) => {
        if (a.card.zLevel < b.card.zLevel) return -1;
        if (a.card.zLevel > b.card.zLevel) return 1;
        return 0;
      })
      .forEach((sprite: CardSprite) => {
        CardSprite.render(sprite)
      })

    this.cardSprites = cardSprites
  }
}
