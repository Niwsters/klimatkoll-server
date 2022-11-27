import { Card } from './card'
import {
  HAND_POSITION,
  HAND_CARD_ANGLE,
  HAND_X_RADIUS,
  HAND_Y_RADIUS,
  HAND_ANGLE_FACTOR
} from './constants'
import { Position } from './position'

function distance(a: number, b: number) {
  return Math.abs(a - b)
}

export class Hand {

  private _cards: Card[]
  private mousePosition: Position = new Position(0, 0)

  private getCardAngle(i: number) {
    const n = this.cards.length - 1
    return HAND_CARD_ANGLE * (i - n/2)
  }

  private getCardPosition(i: number) {
    const angle = this.getCardAngle(i)
    const x = HAND_POSITION.x + HAND_X_RADIUS * Math.sin(angle)
    const y = HAND_POSITION.y - HAND_Y_RADIUS * Math.cos(angle)
    return [x, y]
  }

  private getCardRotation(i: number) {
    let angle = this.getCardAngle(i)
    return angle * HAND_ANGLE_FACTOR
  }

  private closestCardToMouse(mouseX: number): Card | undefined {
    let closestCard: Card | undefined
    for (const card of this.cards) {
      if (!closestCard) closestCard = card

      if (distance(mouseX, card.position.x) < distance(mouseX, closestCard.position.x))
        closestCard = card
    }
    return closestCard
  }

  private zoomInOnCard(card: Card, currentTime: number): Card {
    card = card.move(card.position.x, HAND_POSITION.y - 230, currentTime)
    card = card.setScale(Card.DEFAULT_SCALE * 2, currentTime)
    card = card.rotateGlobal(0, currentTime)
    card.zLevel = 999
    return card
  }

  private moveCardDefault(card: Card, cardIndex: number, currentTime: number): Card {
    const [x, y] = this.getCardPosition(cardIndex)
    const scale = Card.DEFAULT_SCALE
    const rotation = this.getCardRotation(cardIndex)
    card = card.move(x, y, currentTime)
    card = card.rotateGlobal(rotation, currentTime)
    // + 10 to prevent first card going under emissions line card when zooming out
    card.zLevel = cardIndex + 10
    return card.setScale(scale, currentTime)
  }

  private handWidth(): number {
    const leftCard = this.cards[0]
    const rightCard = this.cards[this.cards.length - 1]
    return rightCard.position.x - leftCard.position.x + Card.DEFAULT_WIDTH * Card.DEFAULT_SCALE
  }

  private readonly hoverYAxisLimit: number = HAND_POSITION.y - Card.DEFAULT_HEIGHT * Card.DEFAULT_SCALE
  private isCardFocused(card: Card, mouseX: number, mouseY: number): boolean {
    const width = this.handWidth()
    const closestCard = this.closestCardToMouse(mouseX)
    return closestCard !== undefined &&
           card.id === closestCard.id &&
           mouseY > this.hoverYAxisLimit &&
           mouseX > HAND_POSITION.x - width / 2 &&
           mouseX < HAND_POSITION.x + width / 2
  }

  private zoomHoveredCards(currentTime: number, mouseX: number, mouseY: number): Hand {
    const cards = this._cards.map((card: Card, cardIndex: number) => {
      if (this.isCardFocused(card, mouseX, mouseY))
        return this.zoomInOnCard(card, currentTime)

      return this.moveCardDefault(card, cardIndex, currentTime)
    })

    return new Hand(cards)
  }

  constructor(cards: Card[] = []) {
    this._cards = cards
  }

  get cards(): Card[] {
    return this._cards
  }

  get selectedCard(): Card | undefined {
    return this.cards.find(c => c.selected === true)
  }

  addCard(card: Card): Hand {
    return new Hand([...this._cards, card])
  }

  mouseClicked(mouseX: number, mouseY: number): Hand {
    const cards = this.cards.map(card => {
      if (this.isCardFocused(card, mouseX, mouseY)) {
        return card.select()
      }

      return card.deselect()
    })

    return new Hand(cards)
  }

  animate(currentTime: number): Hand {
    return new Hand(this.cards.map(card => card.update(currentTime)))
  }

  update(currentTime: number, mouseX: number, mouseY: number): Hand {
    return new Hand(this._cards).zoomHoveredCards(currentTime, mouseX, mouseY).animate(currentTime)
  }

  removeCard(card: Card): Hand {
    return new Hand(this.cards.filter(c => c.id !== card.id))
  }
}
