import * as Transition from './transition'

export type Animation = {
  readonly xGoal: Transition.Transition,
  readonly yGoal: Transition.Transition,
  readonly rotationGoal: Transition.Transition,
  readonly addedRotationGoal: Transition.Transition,
  readonly scaleGoal: Transition.Transition
}

export type Animated = {
  readonly x: number,
  readonly y: number,
  readonly rotation: number,
  readonly scale: number
}

type Position = {
  x?: number,
  y?: number,
  rotation?: number,
  scale?: number
}

export function create(position?: Position): Animation {
  return {
    xGoal: Transition.create(position?.x || 0),
    yGoal: Transition.create(position?.y || 0),
    rotationGoal: Transition.create(position?.rotation || 0),
    addedRotationGoal: Transition.create(0),
    scaleGoal: Transition.create(position?.scale || 1)
  }
}

export function animate(
  animation: Animation,
  currentTime: number
): Animated {
  return {
    x: get_x(animation, currentTime),
    y: get_y(animation, currentTime),
    rotation: get_rotation(animation, currentTime) + get_added_rotation(animation, currentTime),
    scale: get_scale(animation, currentTime)
  }
}

export function get_x(animation: Animation, currentTime: number): number {
  return Transition.transpose(animation.xGoal, currentTime)
}

export function move_x(animation: Animation, x: number, currentTime: number): Animation {
  return {
    ...animation,
    xGoal: Transition.update(animation.xGoal, currentTime, get_x(animation, currentTime), x)
  }
}

export function get_y(animation: Animation, currentTime: number): number {
  return Transition.transpose(animation.yGoal, currentTime)
}

export function move_y(animation: Animation, y: number, currentTime: number): Animation {
  return {
    ...animation,
    yGoal: Transition.update(animation.yGoal, currentTime, get_y(animation, currentTime), y)
  }
}

export function get_rotation(animation: Animation, currentTime: number): number {
  return Transition.transpose(animation.rotationGoal, currentTime)
}

export function rotate(animation: Animation, rotation: number, currentTime: number): Animation {
  return {
    ...animation,
    rotationGoal: Transition.update(
      animation.rotationGoal,
      currentTime,
      get_rotation(animation, currentTime),
      rotation
    )
  }
}

export function get_added_rotation(animation: Animation, currentTime: number): number {
  return Transition.transpose(animation.addedRotationGoal, currentTime)
}

export function rotateLocal(animation: Animation, rotation: number, currentTime: number): Animation {
  return {
    ...animation,
    addedRotationGoal: Transition.update(
      animation.addedRotationGoal,
      currentTime,
      get_added_rotation(animation, currentTime),
      rotation
    )
  }
}

export function get_scale(animation: Animation, currentTime: number): number {
  return Transition.transpose(animation.scaleGoal, currentTime)
}

export function scale(animation: Animation, scale: number, currentTime: number): Animation {
  return {
    ...animation,
    scaleGoal: Transition.update(animation.scaleGoal, currentTime, get_scale(animation, currentTime), scale)
  }
}
