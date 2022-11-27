const shader = `
attribute vec2 a_position;
attribute vec2 a_texcoord;

uniform vec2 u_resolution;
uniform vec2 u_translation;
uniform float u_scale;
uniform float u_rotation;
varying vec2 v_texcoord;

void main() {
  mat2 rotation_matrix = mat2(
    cos(u_rotation), -sin(u_rotation),
    sin(u_rotation), cos(u_rotation)
  );
  vec2 position = a_position * rotation_matrix * vec2(u_scale * 0.4423828) + u_translation;

  vec2 zeroToOne = position / vec2(960.0, 540.0);

  vec2 zeroToTwo = zeroToOne * 2.0;

  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

  v_texcoord = a_texcoord;
}
`

export default shader
