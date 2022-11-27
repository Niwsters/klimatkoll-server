import { Card } from "./card"

export class Deck {
  private topCard?: Card

  get cards(): Card[] {
    const topCard = this.topCard
    if (!topCard) return []
    return [topCard]
  }

  constructor(topCard: Card | undefined = undefined) {
    this.topCard = topCard
  }

  setTopCard(card: Card): Deck {
    return new Deck(card)
  }
}
