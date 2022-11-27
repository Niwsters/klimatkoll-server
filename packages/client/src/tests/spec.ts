import { Expect } from './expect'

type getStateFunc = (previousState?: any) => any
type getResultFunc = (state: any) => any

class When {
  private getState: getStateFunc
  private previousState?: any

  private get state(): any {
    return this.getState(this.previousState)
  }

  constructor(getState: getStateFunc, previousState?: any) {
    this.getState = getState
    this.previousState = previousState
  }

  expect(getResult: getResultFunc) {
    return new Expect(getResult(this.state))
  }

  when(getState: getStateFunc) {
    return new When(getState, this.state)
  }

  describe(description: string) {
    process.stdout.write(description)
    return new When(this.getState, this.state)
  }
}

class Spec {
  when(getState: getStateFunc): When {
    return new When(getState)
  }
}

export function spec() {
  return new Spec()
}
