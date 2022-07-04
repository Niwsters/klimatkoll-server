import { cards as cardsEN } from './src/game/cards-en'
import { startGame } from './src/game/start-game'
import { startCardDB } from './src/card-db'
import http from 'http'
import { Card } from './src/card-db/cards/card'

async function getCards(): Promise<Card[]> {
  return new Promise(resolve => {
    http.request(
      {
        host: 'localhost',
        port: '3001',
        path: '/cards/json'
      },
      response => {
        let str = ''
        response.on('data', data => str += data)
        response.on('end', () => resolve(JSON.parse(str)))
      })
      .end()
  })
}

async function start() {
  await startCardDB()
  const cards = await getCards()
  const cardsSV = cards.filter(card => card.language === "swedish")
  startGame(cardsSV, cardsEN)
}

start()
