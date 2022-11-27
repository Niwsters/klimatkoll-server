export interface IPosition {
  readonly x: number
  readonly y: number
}

export type ICard = {
  id: number
  name: string
  position: IPosition
  scale: number
  rotation: number
  addedRotation: number
  zLevel: number
  isSpace: boolean
  visible: boolean
  flipped: boolean
  selected: boolean
}
