import { startGame } from './src/start-game'
import { deckGetter } from './src/card-fetcher'

async function start() {
  startGame(deckGetter())
}

start()
