import { Card } from './card'
import { EMISSIONS_LINE_MAX_LENGTH, EMISSIONS_LINE_POSITION } from './constants'

function insert(array: any[], item: any, position: number): any[] {
  return [
    ...array.slice(0, position+1),
    item,
    ...array.slice(position+1, array.length)
  ]
}

export class EmissionsLine {
  private _cards: Card[]

  constructor(cards: Card[] = []) {
    this._cards = cards
  }

  private new(): EmissionsLine {
    return new EmissionsLine(this._cards)
  }

  private get width(): number {
    let leftCard: Card | undefined
    let rightCard: Card | undefined
    for (const card of this.cards) {
      if (!leftCard)
        leftCard = card

      if (!rightCard)
        rightCard = card

      if (card.position.x < leftCard.position.x)
        leftCard = card

      if (card.position.x > rightCard.position.x)
        rightCard = card
    }

    if (!leftCard || !rightCard)
      return 0

    const cardWidth = Card.DEFAULT_WIDTH * Card.DEFAULT_SCALE
    const x1 = leftCard.position.x - cardWidth / 2
    const x2 = rightCard.position.x + cardWidth / 2

    return x2 - x1 
  }

  private getEmissionsLineCardDistance(): number {
    const cardCount = this.cards.length
    const cardWidth = Card.DEFAULT_WIDTH * Card.DEFAULT_SCALE
    const totalELWidth = cardWidth * cardCount
    let cardDistance = cardWidth / 2
    if (totalELWidth > EMISSIONS_LINE_MAX_LENGTH) {
      cardDistance = (EMISSIONS_LINE_MAX_LENGTH - cardWidth) / (cardCount-1)
    }
    return cardDistance
  }

  private moveELCard(card: Card, i: number, currentTime: number): Card {
    let elCards = this.cards
    const cardCount = elCards.length
    const width = this.getEmissionsLineCardDistance()
    const startOffset = 0 - width*cardCount/2 - width/2

    const x = EMISSIONS_LINE_POSITION.x + startOffset + width * (i+1)
    const y = EMISSIONS_LINE_POSITION.y
    return card.move(x, y, currentTime)
  }
  
  private reformSpaceCards(): Card[] {
    return this._cards
      .filter(c => !c.isSpace)
      .reduce((cards: Card[], card, i) => {
        return [
          ...cards,
          card,
          new SpaceCard(-1-(i+1))
        ]
      }, [new SpaceCard(-1)],)
  }

  private get nonSpaceCards(): Card[] {
    return this.cards.filter(c => !c.isSpace)
  }

  private get spaceCards(): Card[] {
    return this.cards.filter(c => c.isSpace)
  }

  private getClosestCard(x: number, selectedCard: Card | undefined): Card {
    const cards = selectedCard ? this.spaceCards : this.nonSpaceCards

    let closest: Card = cards[0]
    for (const card of cards) {
      if (!closest) {
        closest = card
        continue
      }

      if (Math.abs(card.position.x - x) < Math.abs(closest.position.x - x)) {
        closest = card
      }
    }

    return closest
  }

  private isCardFocused(card: Card, mouseX: number, mouseY: number, selectedCard: Card | undefined): boolean {
    const lowerBoundsY = EMISSIONS_LINE_POSITION.y - Card.DEFAULT_HEIGHT * Card.DEFAULT_SCALE / 2
    const upperBoundsY = EMISSIONS_LINE_POSITION.y + Card.DEFAULT_HEIGHT * Card.DEFAULT_SCALE / 2

    const lowerBoundsX = EMISSIONS_LINE_POSITION.x - this.width / 2
    const upperBoundsX = EMISSIONS_LINE_POSITION.x + this.width / 2

    return mouseX > lowerBoundsX &&
           mouseX < upperBoundsX &&
           mouseY > lowerBoundsY &&
           mouseY < upperBoundsY &&
           card.id === this.getClosestCard(mouseX, selectedCard).id
  }

  private scaleCard(card: Card, mouseX: number, mouseY: number, currentTime: number, selectedCard: Card | undefined): Card {
    if (card.isSpace) return card

    if (this.isCardFocused(card, mouseX, mouseY, selectedCard) && selectedCard === undefined) {
      return card.setScale(Card.DEFAULT_SCALE * 2, currentTime)
    }

    return card.setScale(Card.DEFAULT_SCALE, currentTime)
  }

  private mouse_moved(mouseX: number, mouseY: number, currentTime: number, selectedCard: Card | undefined): EmissionsLine {
    let self = this.new()

    if (self.nonSpaceCards.length < 0)
      return self

    self._cards = self._cards
      .map(card => self.scaleCard(card, mouseX, mouseY, currentTime, selectedCard))

    return self
  }

  update(time: number, mouseX: number, mouseY: number, selectedCard: Card | undefined): EmissionsLine {
    let el = this.new()
    el = el.mouse_moved(mouseX, mouseY, time, selectedCard)

    el._cards = el._cards.map((card: Card, i: number) => this.setCardZLevels(card, i, mouseX, mouseY, selectedCard))

    el._cards = el._cards
      .map(card => card.update(time))
      .map(card => {
        if (card.isSpace) {
          if (el.isCardFocused(card, mouseX, mouseY, selectedCard) && selectedCard) {
            return card.setName(selectedCard.name)
          }

          return card.setName("space")
        }

        return card
      })
    return el
  }

  private setCardZLevels(card: Card, i: number, mouseX: number, mouseY: number, selectedCard: Card | undefined): Card {
    card.zLevel = 10 + i

    if (this.isCardFocused(card, mouseX, mouseY, selectedCard))
      card.zLevel = 999

    return card
  }

  get cards(): Card[] {
    return this._cards
  }

  private showSpaceCards(): EmissionsLine {
    let el = this.new()
    el._cards = el._cards.map(card => {
      if (card.isSpace)
        return card.show()

      return card
    })
    return el
  }

  private hideSpaceCards(): EmissionsLine {
    let el = this.new()
    el._cards = el._cards.map(card => {
      if (card.isSpace)
        return card.hide()

      return card
    })
    return el
  }

  showHideSpaceCards(selectedCard: Card | undefined) {
    if (selectedCard)
      return this.showSpaceCards()
    else
      return this.hideSpaceCards()
  }

  playCard(selectedCard: Card | undefined, mouseX: number, mouseY: number): number {
    const clickedCardIndex = this.cards.findIndex(card => this.isCardFocused(card, mouseX, mouseY, selectedCard))
    return clickedCardIndex
  }

  addCard(card: Card, position: number, currentTime: number): EmissionsLine {
    let self = this.new()

    // Make sure card is flipped
    card.flipped = true

    self._cards = insert(self._cards, card, position)
    self._cards = self.reformSpaceCards()

    self._cards = self._cards.map((card, i) => {
      return self.moveELCard(card, i, currentTime)
    })

    return self
  }
}

class SpaceCard extends Card {
  constructor(id: number) {
    super(id, "space")
    this.visible = false
    this.isSpace = true
  }
}
