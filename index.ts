import { startGame } from './src/game/start-game'
import { startCardDB } from './src/card-db'
import { deckGetter } from './src/game/card-fetcher'

async function start() {
  await startCardDB()
  startGame(deckGetter())
}

start()
