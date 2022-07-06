import http from 'http'
import { Card } from '../../src/card-db/cards/card'
import { sleep } from '../../src/card-db/sleep'

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

export type GetDeck = (language: string) => Card[]

class CardFetcher {
  private _cards: Card[] = []

  async start() {
    while (true) {
      this._cards = await getCards()
      await sleep(1000)
    }
  }

  get cards(): Card[] {
    return this._cards
  }
}

export function fetcher(): CardFetcher {
  const fetcher = new CardFetcher()
  fetcher.start();
  return fetcher;
}

export function deckGetter(): GetDeck {
  const f = fetcher()
  return language => f.cards.filter(card => card.language === language)
}
