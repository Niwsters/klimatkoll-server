import { GameService } from './game.service'
import { SocketService } from './socket.service'
import { SocketEvent, SocketResponse } from './socket'
import { getDeck } from './card-fetcher'

export function startGame() {
  const gameService = new GameService(getDeck)
  const socketService = new SocketService(getDeck)

  socketService.events$.subscribe((event: SocketEvent) => gameService.handleEvent(event))
  gameService.responses$.subscribe((r: SocketResponse) => socketService.handleResponse(r)) 
}
