const shader = `
precision mediump float;

uniform sampler2D u_texture;
uniform bool u_selected;
uniform bool u_isspace;
uniform bool u_visible;

varying vec2 v_texcoord;

vec2 CARD_SIZE = vec2(1024, 1536);
float CARD_MARGIN = 16.0;
vec2 TEXTURE_SIZE = vec2(2048, 2048);
float CORNER_SIZE = 64.0;

vec4 visible(bool u_visible) {
  return vec4(u_visible);
}

vec4 alpha(bool u_isspace) {
  if (u_isspace == true)
    return vec4(1.0, 1.0, 1.0, 0.5);

  return vec4(1.0);
}

vec4 selection_border(bool selected, vec2 uv) {
  if (selected == true) {
    if (uv.x < 19.0 || uv.x > CARD_SIZE.x - 19.0 ||
        uv.y < 19.0 || uv.y > CARD_SIZE.y - 19.0)
    {
      return vec4(1.0, 0.0, 0.0, 1.0);
    }
  }

  return vec4(1.0);
}

float dist(vec2 a, vec2 b) {
  return sqrt(pow(a.x - b.x, 2.0) + pow(a.y - b.y, 2.0));
}

bool upper_left(vec2 coord) {
  return coord.x < CORNER_SIZE && coord.y < CORNER_SIZE && dist(coord, vec2(CORNER_SIZE)) > CORNER_SIZE;
}

bool upper_right(vec2 coord) {
  return coord.x > CARD_SIZE.x - CORNER_SIZE && coord.y < CORNER_SIZE;
}

bool lower_right(vec2 coord) {
  return coord.x > CARD_SIZE.x - CORNER_SIZE && coord.y > CARD_SIZE.y - CORNER_SIZE;
}

bool lower_left(vec2 coord) {
  return coord.x < CORNER_SIZE && coord.y > CARD_SIZE.y - CORNER_SIZE;
}

bool inside_corner(vec2 coord) {
  return (
    upper_left(coord) ||
    upper_right(coord) ||
    lower_right(coord) ||
    lower_left(coord)
  );
}

bool outside_circle(vec2 coord) {
  return dist(coord, vec2(CORNER_SIZE)) > CORNER_SIZE &&
         dist(coord, vec2(CARD_SIZE.x - CORNER_SIZE, CORNER_SIZE)) > CORNER_SIZE &&
         dist(coord, vec2(CORNER_SIZE, CARD_SIZE.y - CORNER_SIZE)) > CORNER_SIZE &&
         dist(coord, CARD_SIZE - vec2(CORNER_SIZE)) > CORNER_SIZE;
}

vec4 round_corners(vec2 coord) {
  return vec4(!(
    outside_circle(coord) && inside_corner(coord)
  ));
}

vec2 uv(vec2 texcoord) {
  return texcoord * TEXTURE_SIZE;
}

vec2 card_coord(vec2 texcoord) {
  return vec2(mod(uv(texcoord).x, CARD_SIZE.x), uv(texcoord).y);
}

vec2 texcoord(vec2 coord) {
  float new_width = TEXTURE_SIZE.x - CARD_MARGIN * 4.0;
  float ratio = new_width / TEXTURE_SIZE.x;
  float m = float(coord.x > CARD_SIZE.x / TEXTURE_SIZE.x);
  return coord * ratio + vec2(CARD_MARGIN) / TEXTURE_SIZE + vec2(CARD_MARGIN * 2.0 / TEXTURE_SIZE.x * m, 0);
}

void main() {
  gl_FragColor = 
    texture2D(u_texture, texcoord(v_texcoord)) *
    selection_border(u_selected, uv(v_texcoord)) *
    round_corners(card_coord(v_texcoord)) *
    alpha(u_isspace) *
    visible(u_visible);
}
`

export default shader
