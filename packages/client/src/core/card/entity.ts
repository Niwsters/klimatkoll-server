import { Position } from '../position'
import { TransitionGoal } from './transition-goal'

export class Entity {
  private time: number = 0
  private xGoal: TransitionGoal
  private yGoal: TransitionGoal
  private rotationGoal: TransitionGoal
  private addedRotationGoal: TransitionGoal
  private scaleGoal: TransitionGoal

  get x(): number {
    return this.xGoal.transpose(this.time)
  }

  get y(): number {
    return this.yGoal.transpose(this.time)
  }

  get position(): Position {
    return new Position(this.x, this.y)
  }

  get rotation(): number {
    return this.rotationGoal.transpose(this.time)
  }

  get addedRotation(): number {
    return this.addedRotationGoal.transpose(this.time)
  }

  get scale(): number {
    return this.scaleGoal.transpose(this.time)
  }

  constructor(
    position: Position = new Position(0, 0),
    rotation: number = 0,
    addedRotation: number = 0,
    scale: number = 1
  ) {
    this.xGoal = new TransitionGoal(0, position.x, position.x)
    this.yGoal = new TransitionGoal(0, position.y, position.y)
    this.rotationGoal = new TransitionGoal(0, rotation, rotation)
    this.addedRotationGoal = new TransitionGoal(0, addedRotation, addedRotation)
    this.scaleGoal = new TransitionGoal(0, scale, scale)
  }

  protected new(): Entity {
    return Object.assign(new Entity(), this)
  }

  move(x: number, y: number, currentTime: number): Entity {
    let entity = this.new()

    entity.xGoal = entity.xGoal.update(currentTime, this.x, x)
    entity.yGoal = entity.yGoal.update(currentTime, this.y, y)

    return entity
  }

  rotateGlobal(rotation: number, currentTime: number): Entity {
    let entity = this.new()
    entity.rotationGoal = entity.rotationGoal.update(currentTime, this.rotation, rotation)
    return entity
  }

  rotateLocal(rotation: number, currentTime: number): Entity {
    let entity = this.new()
    entity.addedRotationGoal = entity.addedRotationGoal.update(currentTime, this.addedRotation, rotation)
    return entity
  }

  setScale(scale: number, currentTime: number): Entity {
    let entity = this.new()
    entity.scaleGoal = entity.scaleGoal.update(currentTime, this.scale, scale)
    return entity
  }

  update(time: number): Entity {
    let entity = this.new()
    entity.time = time
    return entity
  }
}
