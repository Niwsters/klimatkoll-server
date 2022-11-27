import { Card } from "./card";
import { DISCARD_PILE_POSITION } from "./constants";

export class DiscardPile {
  private topCard?: Card

  get cards(): Card[] {
    if (!this.topCard) return []
    return [this.topCard]
  }

  constructor(topCard: Card | undefined = undefined) {
    this.topCard = topCard
  }

  setTopCard(card: Card, currentTime: number): DiscardPile {
    const pos = DISCARD_PILE_POSITION
    card = card.move(pos.x, pos.y, currentTime)
    card = card.rotateGlobal(0, currentTime)
    card = card.rotateLocal(0, currentTime)
    card.flipped = true

    return new DiscardPile(card)
  }

  update(currentTime: number) {
    const topCard = this.topCard
    if (topCard !== undefined)
      return new DiscardPile(topCard.update(currentTime))

    return new DiscardPile(topCard)
  }
}
