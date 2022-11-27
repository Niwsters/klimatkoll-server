interface Material {
  program: WebGLProgram,
  positionAttributeLocation: number,
  resolutionUniformLocation: WebGLUniformLocation,
  texCoordLocation: number
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

export function createMaterial(
  gl: WebGLRenderingContext,
  vsSource: string,
  fsSource: string
): Material {
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource)
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource)
  const program = createProgram(gl, vs, fs)

  return {
    program: program,
    positionAttributeLocation: gl.getAttribLocation(program, "a_position"),
    resolutionUniformLocation: gl.getUniformLocation(program, "u_resolution") as WebGLUniformLocation,
    texCoordLocation: gl.getAttribLocation(program, "a_texcoord")
  }
}
