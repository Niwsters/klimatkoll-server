import { sleep } from './sleep'

export type InboxClosed = 1
export const INBOX_CLOSED: InboxClosed = 1

export class Inbox<T> {
  private messages: T[] = []
  private closed: boolean = false

  send(message: T) {
    this.messages.push(message)
  }

  async receive(): Promise<T | InboxClosed> {
    while (!this.closed) {
      const message = this.messages.shift()
      if (message)
        return message
      await sleep(10)
    }

    return INBOX_CLOSED
  }

  close() {
    this.closed = true
  }
}
