import { startGame } from './game/src/start-game'
import { deckGetter } from './game/src/card-fetcher'

async function start() {
  startGame(deckGetter())
}

start()
