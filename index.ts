import { cards as cardsSV } from './src/game/cards-sv'
import { cards as cardsEN } from './src/game/cards-en'
import { startGame } from './src/game/start-game'
import { startCardDB } from './src/card-db'

startCardDB()
startGame(cardsSV, cardsEN)
