import { expect } from './expect'
import { Inbox, INBOX_CLOSED } from '../inbox'

async function sleep(millis: number) {
  return new Promise(resolve => setTimeout(resolve, millis))
}

async function receivesMessage() {
  const inb = new Inbox<string>()
  inb.send("oh hi")
  const msg = await inb.receive()
  expect(msg).toEqual("oh hi")
}

async function receivesMessageInOrder() {
  const inb = new Inbox<string>()
  inb.send("oh hi")
  inb.send(":D")
  expect(await inb.receive()).toEqual("oh hi")
  expect(await inb.receive()).toEqual(":D")
}

async function awaitsMessageReceive() {
  const inb = new Inbox<string>()
  let received;
  inb.receive().then(message => received = message)
  inb.send("oh hi")
  await sleep(10)
  expect(received).toEqual("oh hi")
}

async function closes() {
  const inb = new Inbox<string>()
  setTimeout(() => inb.close(), 10)
  const result = await inb.receive()
  expect(result).toEqual(INBOX_CLOSED)
}

export default async function() {
  await receivesMessage()
  await receivesMessageInOrder()
  await awaitsMessageReceive()
  await closes()
}
