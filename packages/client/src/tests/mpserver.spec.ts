import { expect } from './expect'
import { MultiPlayerServer } from '../socket/multiplayer-server'
import { sleep } from 'sleep'
import { createEvent } from '@shared/events'

async function sendsMessageViaSocket() {
  let received
  const mpserver = new MultiPlayerServer({ send: message => received = message })
  const event = createEvent(0, "oh_hi", { message: ":D" })
  mpserver.inbox.send(event)
  await sleep(10)
  expect(received).toEqual(event)
  mpserver.close()
}

export default async function() {
  await sendsMessageViaSocket()
}
