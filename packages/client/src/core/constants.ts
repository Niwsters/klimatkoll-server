import { Position } from './position'

export const WIDTH = 960
export const HEIGHT = 540
export const ANIMATION_DURATION_MS = 300
export const HAND_POSITION: Position = new Position(482, HEIGHT+50)
export const OPPONENT_HAND_POSITION: Position = new Position(482, -50)
export const HAND_CARD_ANGLE = Math.PI/5
export const HAND_X_RADIUS = 160
export const HAND_Y_RADIUS = 80
export const HAND_ANGLE_FACTOR = HAND_Y_RADIUS / HAND_X_RADIUS // The angle should not map to the same ellipse as the position
export const EMISSIONS_LINE_POSITION: Position = new Position(482, HEIGHT/2)
export const EMISSIONS_LINE_MAX_LENGTH = 450
export const DECK_POSITION: Position = new Position(WIDTH-100, HEIGHT/2-154/2-20)
export const DISCARD_PILE_POSITION: Position = new Position(WIDTH-100, HEIGHT/2+154/2+20)
export const SP_SOCKET_ID = 1;
