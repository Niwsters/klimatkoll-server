const ANIMATION_DURATION_MS = 300

export function transpose(
  from: number,
  to: number,
  started: number,
  currentTime: number
): number {
  const timePassed = currentTime - started

  if (timePassed > ANIMATION_DURATION_MS) return to

  const fraction = timePassed/ANIMATION_DURATION_MS
  const mult = 1 - (1 - fraction) ** 2 // easeOutQuad easing function
  return from + (to - from)*mult
}
