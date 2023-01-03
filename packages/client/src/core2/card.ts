export type NormalCard = {
  title: string,
  subtitle: string,
  emissions: number,
  descr_front: string,
  descr_back: string,
  duration: string,

  bg_color_front: string,
  bg_color_back: string,

  flipped: boolean,
  selected: boolean,
  isSpace?: boolean
}

export type SpaceCard = {
  isSpace: true,
  visible: boolean
}

export type Card = NormalCard | SpaceCard
