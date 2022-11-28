import vsSource from './shader.vert'
import fsSource from './shader.frag'
import { ICard, CardData } from '@shared/models'

const IMAGE_WIDTH = 1024
const IMAGE_HEIGHT = 1536
const IMAGE_MARGIN = 0
const TEXTURE_WIDTH = 2048
const TEXTURE_HEIGHT = 2048

const CARD_WIDTH = IMAGE_WIDTH - IMAGE_MARGIN
const CARD_HEIGHT = IMAGE_HEIGHT - IMAGE_MARGIN

export class CardSprite {
  card: ICard
  gl: WebGLRenderingContext
  translationLocation: WebGLUniformLocation | null
  scaleLocation: WebGLUniformLocation | null
  rotationLocation: WebGLUniformLocation | null
  selectedLocation: WebGLUniformLocation | null
  isSpaceLocation: WebGLUniformLocation | null
  visibleLocation: WebGLUniformLocation | null
  texCoordLocation = 0
  frontTexCoordBuffer: WebGLBuffer | null
  backTexCoordBuffer: WebGLBuffer | null
  positionBuffer: WebGLBuffer | null
  program: WebGLProgram
  texture: WebGLTexture
  static textures = new Map<string, WebGLTexture>()

  constructor(gl: WebGLRenderingContext, card: ICard) {
    this.card = card
    this.gl = gl

    const x1 = -CARD_WIDTH/2
    const x2 = CARD_WIDTH/2
    const y1 = -CARD_HEIGHT/2
    const y2 = CARD_HEIGHT/2

    const positions = [
      x1, y1,
      x2, y1,
      x1, y2,
      x1, y2,
      x2, y1,
      x2, y2,
    ]    
    const texture = CardSprite.textures.get(card.name)
    if (!texture) {
      throw new Error("No card texture exists with name '" + card.name + "'")
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource)
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource)
    const program = createProgram(gl, vs, fs)

    const positionAttributeLocation = gl.getAttribLocation(program, "a_position")
    const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution")
    const translationLocation = gl.getUniformLocation(program, "u_translation")
    const scaleLocation = gl.getUniformLocation(program, "u_scale")
    const rotationLocation = gl.getUniformLocation(program, "u_rotation")
    const texCoordLocation = gl.getAttribLocation(program, "a_texcoord")
    const selectedLocation = gl.getUniformLocation(program, "u_selected")
    const isSpaceLocation = gl.getUniformLocation(program, "u_isspace")
    const visibleLocation = gl.getUniformLocation(program, "u_visible")

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

    gl.useProgram(program)
    gl.enableVertexAttribArray(positionAttributeLocation)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height)

    const size = 2
    const type = gl.FLOAT
    const normalize = false
    const stride = 0
    const offset = 0
    gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset)

    const backTexCoordBuffer = gl.createBuffer();
    (() => {
      gl.bindBuffer(gl.ARRAY_BUFFER, backTexCoordBuffer)
      const x0 = IMAGE_MARGIN / TEXTURE_WIDTH
      const y0 = IMAGE_MARGIN / TEXTURE_HEIGHT
      const x = CARD_WIDTH / TEXTURE_WIDTH
      const y = CARD_HEIGHT / TEXTURE_HEIGHT
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
          x0,  y0,
          x,  y0,
          x0,  y,
          x0,  y,
          x,  y0,
          x,  y
      ]), gl.STATIC_DRAW)
    })()

    gl.enableVertexAttribArray(texCoordLocation)
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0)

    const frontTexCoordBuffer = gl.createBuffer();
    (() => {
      gl.bindBuffer(gl.ARRAY_BUFFER, frontTexCoordBuffer)
      const x0 = IMAGE_MARGIN * 2 / TEXTURE_WIDTH + CARD_WIDTH / TEXTURE_WIDTH
      const y0 = IMAGE_MARGIN / TEXTURE_HEIGHT
      const x = CARD_WIDTH / TEXTURE_WIDTH * 2
      const y = CARD_HEIGHT / TEXTURE_HEIGHT
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
          x0,  y0,
          x,  y0,
          x0,  y,
          x0,  y,
          x,  y0,
          x,  y
      ]), gl.STATIC_DRAW)
    })()

    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height)

    this.program = program
    this.translationLocation = translationLocation
    this.scaleLocation = scaleLocation
    this.rotationLocation = rotationLocation
    this.selectedLocation = selectedLocation
    this.isSpaceLocation = isSpaceLocation
    this.visibleLocation = visibleLocation
    this.texCoordLocation = texCoordLocation
    this.texture = texture
    this.backTexCoordBuffer = backTexCoordBuffer
    this.frontTexCoordBuffer = frontTexCoordBuffer
    this.positionBuffer = positionBuffer
  }

  static prepareTextures(
    gl: WebGLRenderingContext,
    cards: CardData[],
    baseURL: string
  ): Promise<null> {
    return new Promise(resolve => {
      let loadedCardImages = 0;
      const cardsToLoad = [...cards, { id: "space", name: "space", emissions: 0, language: "any", image: "/space.png" }]
      cardsToLoad.forEach((cardData: CardData) => {
        const image = new Image()
        image.crossOrigin = baseURL
        image.src = `${baseURL}/image${cardData.image}`
        image.onload = () => {
          // Create a texture.
          const texture = gl.createTexture();
          gl.bindTexture(gl.TEXTURE_2D, texture);
         
          // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
          // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
          gl.generateMipmap(gl.TEXTURE_2D)

          if (!texture) throw new Error("texture is null")

          CardSprite.textures.set(cardData.name, texture)
          loadedCardImages++;
          if (loadedCardImages === cards.length) {
            resolve(null)
          }
        }
      })
    })
  }

  static render(sprite: CardSprite) {
    const gl = sprite.gl
    const translationLocation = sprite.translationLocation
    const scaleLocation = sprite.scaleLocation
    const rotationLocation = sprite.rotationLocation
    const selectedLocation = sprite.selectedLocation
    const isSpaceLocation = sprite.isSpaceLocation
    const visibleLocation = sprite.visibleLocation
    const texCoordLocation = sprite.texCoordLocation
    const frontTexCoordBuffer = sprite.frontTexCoordBuffer
    const backTexCoordBuffer = sprite.backTexCoordBuffer
    const program = sprite.program

    gl.useProgram(program)

    if (sprite.card.flipped) {
      gl.bindBuffer(gl.ARRAY_BUFFER, frontTexCoordBuffer)
    } else {
      gl.bindBuffer(gl.ARRAY_BUFFER, backTexCoordBuffer)
    }
    gl.enableVertexAttribArray(texCoordLocation)
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0)

    if (!translationLocation) {
      throw new Error("Could not find WebGL translation location")
    }
    gl.uniform2fv(translationLocation, [sprite.card.position.x, sprite.card.position.y])
    gl.uniform1f(scaleLocation, sprite.card.scale)
    gl.uniform1f(rotationLocation, sprite.card.rotation + sprite.card.addedRotation)
    gl.uniform1i(selectedLocation, sprite.card.selected ? 1 : 0)
    gl.uniform1i(isSpaceLocation, sprite.card.isSpace ? 1 : 0)
    gl.uniform1i(visibleLocation, sprite.card.visible ? 1 : 0)
    gl.bindTexture(gl.TEXTURE_2D, sprite.texture);
    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }

  static delete(sprite: CardSprite, gl: WebGLRenderingContext) {
    gl.deleteBuffer(sprite.frontTexCoordBuffer)
    gl.deleteBuffer(sprite.backTexCoordBuffer)
    gl.deleteBuffer(sprite.positionBuffer)
  }
}

export function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader {

  const shader = gl.createShader(type)

  if (!shader) throw new Error("Failed to create shader of type " + type)

  gl.shaderSource(shader, source)

  gl.compileShader(shader)
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (!success) {
    throw new Error("Could not compile shader:\n" + gl.getShaderInfoLog(shader))
  }

  return shader
}

export function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
): WebGLProgram {

  const program = gl.createProgram()

  if (!program) throw new Error("Failed to create WebGL program")

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  const success = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (!success) {
    throw new Error("Could not create program:\n" + gl.getProgramInfoLog(program))
  }

  return program
}
