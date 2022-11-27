import { Position } from '../position'
import { ICard } from '@shared/models'
import { Entity } from './entity'

export type CardSpecs = {
  id: number,
  name: string,
  emissions: number
}

export function createCard({ id, name, emissions }: CardSpecs): Card {
  return new Card(id, name, new Position(0, 0), 0, 0, Card.DEFAULT_SCALE, emissions)
}

export class Card extends Entity implements ICard {
  static DEFAULT_WIDTH = 445
  static DEFAULT_HEIGHT = 656
  static DEFAULT_SCALE = 0.275

  readonly id: number
  readonly name: string
  readonly emissions: number

  zLevel: number = 0
  visible: boolean = true
  flipped: boolean = false
  selected: boolean = false
  isSpace: boolean = false

  constructor(
    id: number,
    name: string,
    position: Position = new Position(0, 0),
    rotation: number = 0,
    addedRotation: number = 0,
    scale: number = Card.DEFAULT_SCALE,
    emissions: number = 0
  ) {
    super(position, rotation, addedRotation, scale)
    this.id = id
    this.name = name
    this.emissions = emissions
  }

  protected new(): Card {
    return Object.assign(new Card(this.id, this.name), this)
  }

  select(): Card {
    const card = this.new()
    card.selected = true
    return card
  }

  deselect(): Card {
    const card = this.new()
    card.selected = false
    return card
  }

  hide(): Card {
    const card = this.new()
    card.visible = false
    return card
  }

  show(): Card {
    const card = this.new()
    card.visible = true
    return card
  }

  setName(name: string): Card {
    return Object.assign(this, { name })
  }

  move(x: number, y: number, currentTime: number): Card {
    return super.move(x, y, currentTime) as Card
  }

  rotateGlobal(rotation: number, currentTime: number): Card {
    return super.rotateGlobal(rotation, currentTime) as Card
  }

  rotateLocal(rotation: number, currentTime: number): Card {
    return super.rotateLocal(rotation, currentTime) as Card
  }

  setScale(scale: number, currentTime: number): Card {
    return super.setScale(scale, currentTime) as Card
  }

  update(time: number): Card {
    return super.update(time) as Card
  }
}
