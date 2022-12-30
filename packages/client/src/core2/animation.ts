import * as Canvas from '../components/Canvas'
import { ANIMATION_DURATION_MS } from '../core/constants'

export function transpose(transition: Transition, currentTime: number) {
  const timePassed = currentTime - transition.timestamp
  const from = transition.start
  const to = transition.goal

  if (timePassed > ANIMATION_DURATION_MS) return to

  const fraction = timePassed/ANIMATION_DURATION_MS
  const mult = 1 - (1 - fraction) ** 2 // easeOutQuad easing function
  return from + (to - from)*mult
}

export type Transition = {
  readonly timestamp: number,
  readonly start: number,
  readonly goal: number
}

export type AnimatedCard = Canvas.Card & {
  readonly xGoal: Transition,
  readonly yGoal: Transition,
  /*
  readonly rotationGoal: Transition,
  readonly addedRotationGoal: Transition,
  readonly scaleGoal: Transition
  */
}

function transition_init(init: number): Transition {
  return {
    timestamp: 0,
    start: init,
    goal: init 
  }
}

function transition(timestamp: number, start: number, goal: number): Transition {
  return { timestamp, start, goal }
}

export function from_card(card: Canvas.Card): AnimatedCard {
  return {
    ...card,
    xGoal: transition_init(card.x),
    yGoal: transition_init(card.y)
  }
}

export function animate(card: AnimatedCard, currentTime: number): Canvas.Card {
  return {
    ...card,
    x: get_x(card, currentTime),
    y: get_y(card, currentTime)
  }
}

export function get_x(card: AnimatedCard, currentTime: number): number {
  return transpose(card.xGoal, currentTime)
}

export function move_x(card: AnimatedCard, x: number, currentTime: number): AnimatedCard {
  return {
    ...card,
    xGoal: transition(currentTime, get_x(card, currentTime), x)
  }
}

export function get_y(card: AnimatedCard, currentTime: number): number {
  return transpose(card.yGoal, currentTime)
}

export function move_y(card: AnimatedCard, y: number, currentTime: number): AnimatedCard {
  return {
    ...card,
    yGoal: transition(currentTime, get_y(card, currentTime), y)
  }
}
