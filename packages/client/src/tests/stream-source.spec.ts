import { StreamSource } from "../stream";
import { expect } from './expect'

function returnsGivenValue() {
  const stream = new StreamSource<string>("oh hi")
  expect(stream.value).toEqual("oh hi")
}

function returnsNextValue() {
  const stream = new StreamSource<string>("blargh")
  stream.next("honk")
  expect(stream.value).toEqual("honk")
}

async function subscribes() {
  return new Promise(resolve => {
    const stream = new StreamSource<string>("oh hi")
    stream.next(":D")
    stream.subscribe(value => {
      expect(value).toEqual(":D")
      resolve(null)
    })
  })
}

export default async function () {
  returnsGivenValue()
  returnsNextValue()
  await subscribes()
}
