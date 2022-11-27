import { Event, EventToAdd } from '../event/event'
import { StreamChannel } from '../stream';

export class Socket {
  events$: StreamChannel<Event> = new StreamChannel();
  websocket: WebSocket
  socketID: number = -1

  constructor(websocketURL: string, language: string) {
    this.websocket = new WebSocket(websocketURL, language)
    this.websocket.onmessage = (e: MessageEvent) => this.onMessage(e);
    this.websocket.onerror = function (this: WebSocket, _e: any): any {
      throw new Error("Failed to connect to web socket. Is the socket's requested language allowed on the server?")
    }
  }

  private onMessage(e: MessageEvent) {
    const event: any = JSON.parse(e.data)
    event.event_type = event.type
    this.events$.next(event)
  }

  async awaitSocketID() {
    return new Promise(resolve => {
      const sub = this.events$.subscribe(event => {
        if (event.event_type === "socket_id") {
          this.socketID = event.payload.socketID
          resolve(null)
          this.events$.unsubscribe(sub)
        }
      })
    })
  }

  send(event: EventToAdd) {
    this.websocket.send(JSON.stringify(event))
  }

  handleEvent(event: Event): void {
    switch (event.event_type) {
      case "play_card_request":
      case "leave_game":
      case "join_game":
      case "create_game": {
        this.send(event)
      }
    }
  }
}

export async function createSocket(webSocketURL: string, language: string): Promise<Socket> {
  const socket = new Socket(webSocketURL, language)
  await socket.awaitSocketID()
  return socket
}
