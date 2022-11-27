const { deckGetter } = require('@klimatkoll/game/src/card-fetcher')
const { startGame } = require('@klimatkoll/game/src/start-game')
const { startCardDB } = require( '@klimatkoll/card-db/src/start-card-db')

async function start() {
  await startCardDB()
  startGame(deckGetter())
}

start()
