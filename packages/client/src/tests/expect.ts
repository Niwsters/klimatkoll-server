import deepEqual from 'fast-deep-equal'

function assertEquals(expected: any, result: any) {
  if (!deepEqual(expected, result)) {
    throw new Error(`Expected ${JSON.stringify(result, null, 4)} to equal ${JSON.stringify(expected, null, 4)}`)
  } else {
    process.stdout.write('.')
  }
}

export class Expect {
  private result: any
  constructor(result: any) {
    this.result = result
  }

  toEqual(expected: any) {
    assertEquals(expected, this.result)
  }
}

export function expect(result: any) {
  return new Expect(result)
}

export function fail(message: string) {
  throw new Error(`Test failed: ${message}`)
}
