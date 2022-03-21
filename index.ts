import { GameService } from './src/game.service'
import { SocketService } from './src/socket.service'
import { SocketEvent, SocketResponse } from './src/socket'
import { cards as cardsSV } from './src/cards-sv'
import { cards as cardsEN } from './src/cards-en'

const gameService = new GameService(cardsSV, cardsEN)
const socketService = new SocketService()

socketService.events$.subscribe((event: SocketEvent) => gameService.handleEvent(event))
//socketService.events$.subscribe((event: SocketEvent) => console.log("From client:", event))
gameService.responses$.subscribe((r: SocketResponse) => socketService.handleResponse(r))
//gameService.responses$.subscribe((r: SocketResponse) => console.log("Response:", r))
