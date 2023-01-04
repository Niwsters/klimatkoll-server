const ANIMATION_DURATION_MS = 300

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

export function create(init: number): Transition {
  return {
    timestamp: 0,
    start: init,
    goal: init 
  }
}

export function update(
  transition: Transition,
  timestamp: number,
  start: number,
  goal: number
): Transition {
  if (transition.goal === goal) {
    return { ...transition }
  }

  return { timestamp, start, goal }
}
