import { Card } from 'core/card'
import { Hand } from 'core/hand'
import { OpponentHand } from 'core/opponent-hand'
import { Event, EventToAdd, playCardRequestEvent } from 'event/event'
import {
  DECK_POSITION
} from 'core/constants'
import { EmissionsLine } from 'core/emissionsline'
import { Deck } from 'core/deck'
import { DiscardPile } from 'core/discard-pile'

export class GameState {
  isMyTurn: boolean = false
  socketID: number
  statusMessage: string = ""
  roomID: string = ""
  lastUpdate: number = 0

  emissionsLine: EmissionsLine = new EmissionsLine()
  opponentHand: OpponentHand = new OpponentHand()
  hand: Hand = new Hand()
  deck: Deck = new Deck()
  discardPile: DiscardPile = new DiscardPile()

  private mouseX: number = 0
  private mouseY: number = 0
  private t: (key: string) => string

  new(): GameState {
    return Object.assign(new GameState(this.socketID, this.t), this)
  }

  private removeHandCard(card: Card): GameState {
    let state = this.new()

    state.hand = state.hand.removeCard(card)
    state.opponentHand = state.opponentHand.removeCard(card)

    return state
  }

  constructor(socketID: number, t: (key: string) => string) {
    this.socketID = socketID
    this.t = t
  }

  get cards(): Card[] {
    return [
      ...this.emissionsLine.cards,
      ...this.opponentHand.cards,
      ...this.hand.cards,
      ...this.deck.cards,
      ...this.discardPile.cards
    ]
  }

  update(time: number): GameState {
    let state = this.new()

    state.hand = state.hand.update(time, state.mouseX, state.mouseY)
    state.emissionsLine = state.emissionsLine.update(time, state.mouseX, state.mouseY, state.hand.selectedCard)
    state.opponentHand = state.opponentHand.update(time)
    state.discardPile = state.discardPile.update(time)
    state.lastUpdate = time

    return state
  }

  game_won(event: Event): [GameState, EventToAdd[]] {
    let state = this.new()

    if (state.socketID === event.payload.socketID) {
      state.statusMessage = this.t('you-won')
    } else {
      state.statusMessage = this.t('you-lost')
    }

    return [state, []]
  }

  mouse_clicked(_: Event): [GameState, EventToAdd[]] {
    let state = this.new()
    
    const playPosition = state.emissionsLine.playCard(state.hand.selectedCard, state.mouseX, state.mouseY)
    const playedCard = state.hand.selectedCard

    state.hand = state.hand.mouseClicked(state.mouseX, state.mouseY);
    state.emissionsLine = state.emissionsLine.showHideSpaceCards(state.hand.selectedCard);

    let events: EventToAdd[] = []
    if (playPosition > -1 && playedCard) {
      if (!playedCard) throw new Error("Can't play card: No card selected")
      events = [playCardRequestEvent(playedCard.id, playPosition)]
    }

    return [state, events]
  }

  next_card(event: Event): [GameState, EventToAdd[]] {
    let state = this.new()

    const serverCard = event.payload.card
    const card = new Card(serverCard.id, serverCard.name, DECK_POSITION)

    state.deck = state.deck.setTopCard(card)

    return [state, []]
  }

  mouse_moved(event: Event): [GameState, EventToAdd[]] {
    let state = this.new()

    const mouseX = event.payload.mouseX
    const mouseY = event.payload.mouseY
    state.mouseX = mouseX
    state.mouseY = mouseY

    return [state, []]
  }

  incorrect_card_placement(
    event: Event,
    currentTime: number = Date.now()
  ): [GameState, EventToAdd[]] {
    let state = this.new()

    let card = state.cards.find(card => card.id === event.payload.cardID)
    if (!card)
      return [state, []]

    state = state.removeHandCard(card)
    state.discardPile = state.discardPile.setTopCard(card, currentTime)

    return [state, []]
  }

  draw_card(event: Event): [GameState, EventToAdd[]] {
    let state = this.new()
    const server_card = event.payload.card

    const card = new Card(server_card.id, server_card.name, DECK_POSITION)
    if (event.payload.socketID === state.socketID) {
      state.hand = state.hand.addCard(card)
    } else {
      state.opponentHand = state.opponentHand.addCard(card)
    }

    return [state, []]
  }

  socket_id(event: Event): [GameState, EventToAdd[]] {
    let state = this.new()
    state.socketID = event.payload.socketID
    return [state, []]
  }

  card_played_from_deck(event: Event, currentTime: number = Date.now()): [GameState, EventToAdd[]] {
    let state = this.new()

    const serverCard = event.payload.card
    const position = event.payload.position

    const card = new Card(serverCard.id, serverCard.name)
    state.emissionsLine = state.emissionsLine.addCard(card, position, currentTime)
    return [state, []]
  }

  card_played_from_hand(event: Event, timePassed: number = Date.now()): [GameState, EventToAdd[]] {
    let state = this.new()
    // { socketID, cardID, position }
    // Movement card to emissions line
    const playedCard = state.cards.find(c => c.id === event.payload.cardID)
    if (!playedCard) {
      throw new Error("Played card does not exist with ID: " + event.payload.cardID)
    }

    const position = event.payload.position

    // Remove hand card
    state = state.removeHandCard(playedCard)

    // Add EL card
    const movedCard = new Card(playedCard.id, playedCard.name, playedCard.position)
    state.emissionsLine = state.emissionsLine.addCard(movedCard, position, timePassed)

    return [state, []]
  }

  player_turn(event: Event): [GameState, EventToAdd[]] {
    let state = this.new()

    if (state.socketID === event.payload.socketID) {
      state.isMyTurn = true
      state.statusMessage = this.t('your-turn')
    } else {
      state.isMyTurn = false
      state.statusMessage = this.t('opponents-turn')
    }

    return [state, []]
  }

  private reset(): GameState {
    let state = new GameState(this.socketID, this.t)
    state.socketID = this.socketID
    return state
  }

  leave_game(): [GameState, EventToAdd[]] {
    return [this.reset(), []]
  }

  game_removed(): [GameState, EventToAdd[]] {
    return [this.reset(), []]
  }
}
