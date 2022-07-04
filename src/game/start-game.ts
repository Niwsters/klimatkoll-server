import { GameService } from './game.service'
import { SocketService } from './socket.service'
import { SocketEvent, SocketResponse } from './socket'
import { Card } from './cards'

export function startGame(cardsSV: Card[], cardsEN: Card[]) {
  const gameService = new GameService(cardsSV, cardsEN)
  const socketService = new SocketService(cardsSV, cardsEN)

  socketService.events$.subscribe((event: SocketEvent) => gameService.handleEvent(event))
  gameService.responses$.subscribe((r: SocketResponse) => socketService.handleResponse(r)) 
}
