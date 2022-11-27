import { StreamChannel } from '../stream'
import { expect } from './expect'

async function subscribes() {
  return new Promise(resolve => {
    const stream = new StreamChannel()
    stream.subscribe(value => {
      expect(value).toEqual(":D")
      resolve(null)
    })
    stream.next(":D")
  })
}

function unsubscribes() {
  const stream = new StreamChannel<string>()
  let result = ":D"
  const subscription = stream.subscribe(value => result = value)
  stream.unsubscribe(subscription)
  stream.next("oh hi")
  expect(result).toEqual(":D")
}

export default async function() {
  await subscribes()
  unsubscribes()
}
