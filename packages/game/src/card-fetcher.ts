import { Card } from '@klimatkoll/card-db/src/cards/card'
import { sleep } from '@klimatkoll/card-db/src/sleep'
import { httpGetCardDB } from './http-get-card-db'

async function getCards(): Promise<Card[]> {
  return httpGetCardDB<Card[]>('/cards/json')
}

export type GetDeck = (language: string) => Card[]

function cardFetcher() {
  let cards: Card[] = []

  const loop = async () => {
    while (true) {
      cards = await getCards()
      await sleep(1000)
    }
  }
  loop()

  return () => cards
}

const allCards = cardFetcher()

export const getDeck: GetDeck = language => allCards().filter(card => card.language === language)
