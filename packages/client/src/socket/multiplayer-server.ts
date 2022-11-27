import { EventToAdd } from "@shared/events";
import { Inbox, INBOX_CLOSED } from "inbox";

type ISocket = {
  send: (message: EventToAdd) => void
}

export class MultiPlayerServer {
  private socket: ISocket
  private closed: boolean = false

  readonly inbox: Inbox<EventToAdd> = new Inbox()

  private async start() {
    while (!this.closed) {
      const event = await this.inbox.receive()
      if (event !== INBOX_CLOSED)
        this.socket.send(event)
    }
  }

  constructor(socket: ISocket) {
    this.socket = socket
    this.start()
  }

  close() {
    this.closed = true
    this.inbox.close()
  }
}
