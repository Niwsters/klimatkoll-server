import seedrandom from 'seedrandom'
import { BehaviorSubject, Subscription } from 'rxjs'
import { filter, map } from 'rxjs/operators'
import { Card, CardData } from './cards'
import { Socket, SocketEvent, SocketResponse } from './socket'

export class GameEvent {
  event_id: number
  event_type: string
  payload: any

  constructor(eventID: number, type: string, payload: any = {}) {
    this.event_id = eventID
    this.event_type = type
    this.payload = payload
  }
}

export class Player {
  socketID: number
  hand: Card[] = []

  constructor(socketID: number) {
    this.socketID = socketID
  }
}

export class GameState {
  player1: Player
  player2?: Player
  playerTurn?: number
  deck: Card[] = []
  clientEvents: GameEvent[] = []
  emissionsLine: Card[] = []
  roomID: string

  constructor(roomID: string, seed: string, deck: Card[], socketID: number) {
    this.roomID = roomID
    this.deck = GameState.shuffle(deck, seed)
    this.player1 = new Player(socketID)

    let state = GameState.createClientEvent(this, "room_joined", { roomID: roomID })
    state = GameState.createClientEvent(state, "waiting_for_players")

    return state
  }

  static clientEventsToResponses(clientEvents: GameEvent[], socketID: number): SocketResponse[] {
    return clientEvents.map((event: GameEvent) => {
      return {
        ...event,
        socketID: socketID
      }
    })
  }

  static getPlayer1Responses(game: GameState): SocketResponse[] {
    return GameState.clientEventsToResponses(game.clientEvents, game.player1.socketID)
  }

  static getPlayer2Responses(game: GameState): SocketResponse[] {
    const player2 = game.player2
    let c2r: SocketResponse[] = []
    if (player2 !== undefined)
      c2r = GameState.clientEventsToResponses(game.clientEvents, player2.socketID)
    return c2r;
  }

  static getPlayer(state: GameState, socketID: number): Player {
    if (state.player1 && state.player1.socketID === socketID)
      return state.player1

    if (state.player2 && state.player2.socketID === socketID)
      return state.player2

    throw new Error(`No player with socketID: ${socketID}`)
  }

  static getOpponent(state: GameState, socketID: number): Player {
    const player = GameState.getPlayer(state, socketID)

    if (!state.player2)
      throw new Error("Both players must be defined to return an opponent")

    if (state.player1.socketID === player.socketID) {
      return state.player2
    } else {
      return state.player1
    }
  }

  static shuffle(deck: Card[], seed: string): Card[] {
    deck = deck.slice()
    const random = seedrandom(seed)

    for (let i = deck.length - 1; i > 0; i--) {
      var j = Math.floor(random() * (i + 1));
      var temp = deck[i];
      deck[i] = deck[j];
      deck[j] = temp;
    }

    return deck
  }

  static playerConnected(state: GameState, payload: any) {
    if (state.player2 !== undefined)
      return {...state}

    state = {
      ...state,
      player2: {
        hand: [],
        socketID: payload.socketID
      }
    }

    const player1 = state.player1 as Player
    const player2 = state.player2 as Player
    state = GameState.createClientEvent(state, "room_joined", { roomID: state.roomID })
    state = GameState.createClientEvent(state, "playing")
    state = GameState.drawCard(state, player1.socketID)
    state = GameState.drawCard(state, player1.socketID)
    state = GameState.drawCard(state, player1.socketID)
    state = GameState.drawCard(state, player2.socketID)
    state = GameState.drawCard(state, player2.socketID)
    state = GameState.drawCard(state, player2.socketID)
    state = GameState.setPlayerTurn(state, player1.socketID)
    state = GameState.playCardFromDeck(state)

    return {...state}
  }

  static createClientEvent(state: GameState, eventType: string, payload: any = {}): GameState {
    return {
      ...state,
      clientEvents: [
        ...state.clientEvents,
        new GameEvent(state.clientEvents.length, eventType, payload)
      ]
    }
  }

  static drawCard(oldState: GameState, socketID: number): GameState {
    let state = {...oldState}

    const foundCard = state.deck[state.deck.length-1];
    if (!foundCard) throw new Error("Deck ran out of cards")
    const card: Card = { ...foundCard };

    if (state.player1 && state.player1.socketID === socketID) {
      state = {
        ...state,
        player1: {
          ...state.player1,
          hand: [
            ...state.player1.hand,
            card
          ]
        }
      }
    } else if (state.player2 && state.player2.socketID === socketID) {
      state = {
        ...state,
        player2: {
          ...state.player2,
          hand: [
            ...state.player2.hand,
            card
          ]
        }
      }
    } else {
      throw new Error("Player not in game with socketID: " + socketID)
    }

    state = {
      ...state,
      deck: state.deck.slice(0, state.deck.length-1)
    }
    state = GameState.createClientEvent(state, "draw_card", {
      card: card,
      socketID: socketID
    })
    state = GameState.createClientEvent(state, "next_card", {
      card: {...state.deck[state.deck.length-1]}
    })

    return state
  }

  static setPlayerTurn(state: GameState, socketID: number): GameState {
    if (state.player2 === undefined)
      throw new Error("Player 2 is undefined")

    let result: GameState = {
      ...state,
      playerTurn: socketID
    }

    result = GameState.createClientEvent(result, "player_turn", { socketID: result.playerTurn })

    return result
  }

  static playCardFromDeck(oldState: GameState): GameState {
    let state = {...oldState}

    const emissionsLine = state.deck.slice(state.deck.length-1, state.deck.length)

    state = GameState.createClientEvent(state, "card_played_from_deck", {
      card: {...emissionsLine[0]},
      position: 0
    })

    const deck = state.deck.slice(0, state.deck.length-1)

    state = GameState.createClientEvent(state, "next_card", {
      card: {...deck[deck.length-1]}
    })

    return {
      ...state,
      deck: deck,
      emissionsLine: emissionsLine
    }
  }

  static playCard(oldState: GameState, socketID: number, cardID: number, position: number): GameState {
    return GameState.play_card_request(oldState, { socketID, cardID, position })
  }

  static play_card_request(oldState: GameState, payload: any): GameState {
    let state = {...oldState}
    let card: Card

    const socketID = payload.socketID
    const cardID = payload.cardID
    const position = payload.position

    if (!state.player2)
      throw new Error("Can't play card: player 2 is undefined")

    // If either player's hand is empty, i.e. game is over, ignore event
    if (state.player1.hand.length === 0 ||
        state.player2.hand.length === 0)
      return state

    // If it is not player's turn, ignore event
    if (
      (state.player1.socketID === socketID && state.playerTurn !== state.player1.socketID) ||
      (state.player2.socketID === socketID && state.playerTurn !== state.player2.socketID)
    ) return state

    if (state.player1.socketID === socketID) {
      const foundCard = state.player1.hand.find((c: Card) => c.id === cardID)
      if (foundCard === undefined)
        throw new Error(`Player 1 does not have card with ID: ${cardID}`)
      card = foundCard

      state = {
        ...state,
        player1: {
          ...state.player1,
          hand: state.player1.hand.filter((c: Card) => c.id !== cardID)
        }
      }
    } else {
      const foundCard = state.player2.hand.find((c: Card) => c.id === cardID)
      if (foundCard === undefined)
        throw new Error(`Player 2 does not have card with ID: ${cardID}`)
      card = foundCard

      state = {
        ...state,
        player2: {
          ...state.player2,
          hand: state.player2.hand.filter((c: Card) => c.id !== cardID)
        }
      }
    }

    // Change player's turn
    state = GameState.setPlayerTurn(state, GameState.getOpponent(state, socketID).socketID)

    // Position works like this: [s,0,s,1,s,2,s] where s is a "shadow card" where
    // card can be placed, and 0,1,2 are card indexes in the emissions line
    const shadowedEL = state.emissionsLine.reduce((shadowedEL: (Card | null)[], card: Card) => {
      return [
        ...shadowedEL,
        card,
        null
      ]
    }, [null])

    // If card placement is incorrect, move card to bottom of deck
    const cardBefore = shadowedEL[position - 1]
    const cardAfter = shadowedEL[position + 1]
    if (
      (cardBefore && cardBefore.emissions > card.emissions) ||
      (cardAfter && cardAfter.emissions < card.emissions)
    ) {
      state = GameState.drawCard(state, socketID)
      state = GameState.createClientEvent(state, "incorrect_card_placement", {
        cardID: card.id,
        socketID: socketID
      })

      return {
        ...state,
        deck: [card, ...state.deck]
      }
    }
    
    // If card placement is correct, play card to emissions line 
    shadowedEL[position] = card

    state = GameState.createClientEvent(state, "card_played_from_hand", {
      cardID: card.id, position: position, socketID: socketID
    })

    const emissionsLine = shadowedEL.reduce((EL: Card[], card: Card | null) => {
      if (!card) return EL

      return [
        ...EL,
        card
      ]
    }, [])

    state = {...state, emissionsLine: emissionsLine}

    // If player ran out of cards, they won
    const player = GameState.getPlayer(state, socketID)
    if (player.hand.length === 0)
      state = GameState.createClientEvent(state, "game_won", {
        socketID: player.socketID
      })

    return state
  }

  static playerDisconnected(state: GameState, payload: any): GameState {
    return GameState.createClientEvent(state, "opponent_disconnected")
  }

  static handleEvent(state: GameState, event: GameEvent): GameState {
    switch(event.event_type) {
      case "player_connected": {
        return GameState.playerConnected(state, event.payload)
      }
      case "player_disconnected": {
        return GameState.playerDisconnected(state, event.payload)
      }
    }

    return {...state}
  }

  /*
  static fromEvents(roomID: string, events: GameEvent[]): GameState {
    return events.reduce((state: GameState, event: GameEvent): GameState => {
      state = {...state}

      const createClientEvent = (eventType: string, payload: any = {}): void => {
        state = GameState.createClientEvent(state, eventType, payload)
      }

      const type = event.event_type

      return state
    }, new GameState(roomID))
  }
  */
}
