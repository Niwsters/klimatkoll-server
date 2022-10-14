import { GameService } from './game.service'
import { SocketService } from './socket.service'
import { SocketEvent, SocketResponse } from './socket'
import { GetDeck } from './card-fetcher'

export function startGame(deck: GetDeck) {
  const gameService = new GameService(deck)
  const socketService = new SocketService(deck)

  socketService.events$.subscribe((event: SocketEvent) => gameService.handleEvent(event))
  gameService.responses$.subscribe((r: SocketResponse) => socketService.handleResponse(r)) 
}
