import { startGame } from './src/game/start-game'
import { deckGetter } from './src/game/card-fetcher'
import { startCardDB } from './src/card-db'

async function start() {
  await startCardDB()
  startGame(deckGetter())
}

start()
