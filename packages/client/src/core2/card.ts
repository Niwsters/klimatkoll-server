import * as Animation from './animation'

export type CardPositioning = {
  readonly zLevel: number,
  readonly x: number,
  readonly y: number,
  readonly rotation: number,
  readonly scale: number
}

export type Card = CardPositioning & {
  readonly name: string,
  readonly flipped: boolean,
  readonly selected: boolean,
  readonly visible: boolean,
  readonly isSpace: boolean,
  readonly animation: Animation.Animation
}

export function create(name: string, positioning: CardPositioning): Card {
  return {
    name,
    ...positioning,
    animation: Animation.create(positioning),
    flipped: false,
    selected: false,
    visible: true,
    isSpace: false
  }
}

export function update(card: Card, currentTime: number): Card {
  const animated = Animation.animate(card.animation, currentTime)
  return {
    ...card,
    ...animated
  }
}

export function move_x(card: Card, x: number, currentTime: number): Card {
  return {
    ...card,
    animation: Animation.move_x(card.animation, x, currentTime)
  }
}

export function move_y(card: Card, y: number, currentTime: number): Card {
  return {
    ...card,
    animation: Animation.move_y(card.animation, y, currentTime)
  }
}

export function rotate(card: Card, rotation: number, currentTime: number): Card {
  return {
    ...card,
    animation: Animation.rotate(card.animation, rotation, currentTime)
  }
}

export function scale(card: Card, scale: number, currentTime: number): Card {
  return {
    ...card,
    animation: Animation.scale(card.animation, scale, currentTime)
  }
}

export function spaceCard(positioning: CardPositioning, visible: boolean): Card {
  return { ...create("space", positioning), isSpace: true, visible }
}
