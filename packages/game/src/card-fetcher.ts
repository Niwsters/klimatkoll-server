import { Card } from '@klimatkoll/card-db/src/cards/card'
import { sleep } from '@klimatkoll/card-db/src/sleep'
import { httpGetCardDB } from './http-get-card-db'

async function getCards(): Promise<Card[]> {
  return httpGetCardDB<Card[]>('/cards/json')
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
