import { startGame } from './src/game/start-game'
import { deckGetter } from './src/game/card-fetcher'

async function start() {
  startGame(deckGetter())
}

start()
