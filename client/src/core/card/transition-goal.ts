import { transpose } from './transpose'

export class TransitionGoal {
  readonly timestamp: number
  readonly start: number
  readonly goal: number

  constructor(timestamp: number, start: number, goal: number) {
    this.timestamp = timestamp
    this.start = start
    this.goal = goal
  }

  update(timestamp: number, start: number, goal: number): TransitionGoal {
    if (this.goal === goal)
      return new TransitionGoal(this.timestamp, this.start, this.goal)

    return new TransitionGoal(timestamp, start, goal)
  }

  transpose(currentTime: number): number {
    return transpose(this.start, this.goal, currentTime - this.timestamp)
  }
}
