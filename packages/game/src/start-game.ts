import { GameService } from './game.service'
import { SocketService } from './socket.service'
import { SocketEvent, SocketResponse } from './socket'
import { GetDeck, deckGetter } from './card-fetcher'

export function startGame(deck: GetDeck = deckGetter()) {
  const gameService = new GameService(deck)
  const socketService = new SocketService(deck)

  socketService.events$.subscribe((event: SocketEvent) => gameService.handleEvent(event))
  gameService.responses$.subscribe((r: SocketResponse) => socketService.handleResponse(r)) 
}
