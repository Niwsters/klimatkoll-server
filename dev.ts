import { startGame } from './game/src/start-game'
import { deckGetter } from './game/src/card-fetcher'
import { startCardDB } from './card-db/src'

async function start() {
  await startCardDB()
  startGame(deckGetter())
}

start()
