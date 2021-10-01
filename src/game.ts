import seedrandom from 'seedrandom'
import { BehaviorSubject, Subscription } from 'rxjs'
import { filter, map } from 'rxjs/operators'
import { Card, CardData } from './cards'
import { Socket, SocketEvent } from './socket'

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

export class Game {
  events$: BehaviorSubject<GameEvent[]> = new BehaviorSubject<GameEvent[]>([])
  lastGameEventID: number = 0
  subscriptions: Subscription[] = []
  private player1: Socket
  private player2?: Socket

  get sockets(): Socket[] {
    if (this.player2) {
      return [this.player1, this.player2]
    }

    return [this.player1]
  }

  get events(): GameEvent[] {
    return this.events$.value
  }

  constructor(player1: Socket, cardData: CardData[]) {
    this.player1 = player1
    this.subscribePlayer(player1)

    let lastCardID = 0
    const deck = cardData.map((card: CardData) => {
      return {
        ...card,
        id: lastCardID++
      }
    })

    const events = [
      this.gameEvent("game_started", { seed: this.newSeed(), deck: deck }),
      this.gameEvent("player_connected", { socketID: player1.socketID })
    ]
    this.events$.next(events)
  }

  subscribePlayer(player: Socket) {
    const sub = player.events$
      .pipe(
        filter((event: SocketEvent) => event.context == "game"),
        map((event: SocketEvent): GameEvent => {
          return this.gameEvent(event.type, event.payload)
        })
      )
      .subscribe((event: GameEvent) => {
        this.events$.next([
          ...this.events,
          event
        ])
      })

    this.subscriptions.push(sub)

    this.events$.subscribe(events => {
      // If game crashes (i.e. fromEvents can't compile), log the error and
      // disconnect the player
      try {
        const state = GameState.fromEvents(events)
        player.sendEvent("events", state.clientEvents)
      } catch (e) {
        console.log(e)
        player.sendEvent("room_left", { socketID: player.socketID })
      }
    })
  }

  unsubscribePlayers() {
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }

  addPlayer2(player2: Socket) {
    if (!this.player2) this.player2 = player2

    this.subscribePlayer(player2)

    this.events$.next([
      ...this.events,
      this.gameEvent("player_connected", { socketID: player2.socketID })
    ])
  }

  newSeed(): string {
    let result           = ''
    const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    for ( var i = 0; i < 10; i++ ) {
      result += characters.charAt(Math.floor(seedrandom()() * charactersLength))
    }
    return result
  }

  newGame(): void {
    if (!this.player2) {
      throw new Error("Trying to start new game with only one player")
    }

    this.events$.next([
      this.gameEvent("game_started", { seed: this.newSeed() }),
      this.gameEvent("player_connected", { socketID: this.player1.socketID }),
      this.gameEvent("player_connected", { socketID: this.player2.socketID })
    ])
  }

  gameEvent(eventType: string, payload: any = {}) {
    return new GameEvent(this.lastGameEventID++, eventType, payload)
  }
}

export class GameState {
  player1?: Player
  player2?: Player
  playerTurn?: number
  deck: Card[] = []
  clientEvents: GameEvent[] = []
  emissionsLine: Card[] = []

  static getPlayer(state: GameState, socketID: number): Player {
    if (state.player1 && state.player1.socketID === socketID)
      return state.player1

    if (state.player2 && state.player2.socketID === socketID)
      return state.player2

    throw new Error(`No player with ID: ${socketID}`)
  }

  static getOpponent(state: GameState, socketID: number): Player {
    if (!state.player1) throw new Error("Player 1 is undefined")
    if (!state.player2) throw new Error("Player 2 is undefined")

    if (state.player1.socketID === socketID) return state.player2
    if (state.player2.socketID === socketID) return state.player1

    throw new Error("SocketID does not match any player")
  }

  static createEvent(eventID: number, type: string, payload: any = {}): GameEvent {
    return {
      event_id: eventID,
      event_type: type,
      payload: payload
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

  static gameStarted(state: GameState, payload: any): GameState {
    return {
      ...state,
      deck: [...GameState.shuffle(payload.deck, payload.seed)]
    }
  }

  static playerConnected(state: GameState, payload: any) {
    if (state.player1 === undefined) {
      return {
        ...GameState.createClientEvent(state, "waiting_for_players"),
        player1: {
          hand: [],
          socketID: payload.socketID
        }
      }
    } else if (state.player2 === undefined) {
      state = {
        ...state,
        player2: {
          hand: [],
          socketID: payload.socketID
        }
      }

      const player1 = state.player1 as Player
      const player2 = state.player2 as Player
      state = GameState.createClientEvent(state, "playing")
      state = GameState.drawCard(state, player1.socketID)
      state = GameState.drawCard(state, player1.socketID)
      state = GameState.drawCard(state, player1.socketID)
      state = GameState.drawCard(state, player2.socketID)
      state = GameState.drawCard(state, player2.socketID)
      state = GameState.drawCard(state, player2.socketID)
      state = GameState.setPlayerTurn(state, player1.socketID)
      state = GameState.playCardFromDeck(state)
    }

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

    const card = {...state.deck[state.deck.length-1]}
    if (!card) throw new Error("Deck ran out of cards")

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
    if (state.player1 === undefined)
      throw new Error("Player 1 is undefined")

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
    let state = {...oldState}
    let card: Card | undefined = undefined

    if (!state.player1)
      throw new Error("Can't play card: player 1 is undefined")

    if (!state.player2)
      throw new Error("Can't play card: player 2 is undefined")

    // If either player's hand is empty, i.e. game is over, ignore event
    if (state.player1.hand.length === 0 ||
        state.player2.hand.length === 0)
      return state

    if (state.player1.socketID === socketID) {
      if (state.playerTurn !== state.player1.socketID)
        return state

      card = state.player1.hand.find((c: Card) => c.id === cardID)
      if (card === undefined)
        throw new Error(`Player 1 does not have card with ID: ${cardID}`)

      state = {
        ...state,
        player1: {
          ...state.player1,
          hand: state.player1.hand.filter((c: Card) => c.id !== cardID)
        }
      }
    } else {
      if (state.playerTurn !== state.player2.socketID)
        return state

      card = state.player2.hand.find((c: Card) => c.id === cardID)
      if (card === undefined)
        throw new Error(`Player 2 does not have card with ID: ${cardID}`)

      state = {
        ...state,
        player2: {
          ...state.player2,
          hand: state.player2.hand.filter((c: Card) => c.id !== cardID)
        }
      }
    }

    if (!card) 
      throw new Error("Can't play card: card undefined")

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

    // Change player's turn
    state = GameState.setPlayerTurn(state, GameState.getOpponent(state, socketID).socketID)

    // If player ran out of cards, they won
    const player = GameState.getPlayer(state, socketID)
    if (player.hand.length === 0)
      state = GameState.createClientEvent(state, "game_won", {
        socketID: player.socketID
      })

    return state
  }

  static fromEvents(events: GameEvent[]): GameState {
    return events.reduce((state: GameState, event: GameEvent): GameState => {
      state = {...state}

      const createClientEvent = (eventType: string, payload: any = {}): void => {
        state = GameState.createClientEvent(state, eventType, payload)
      }

      const type = event.event_type
      if (type == "game_started") {
        return GameState.gameStarted(state, event.payload)
      } else if (type == "player_connected") {
        return GameState.playerConnected(state, event.payload)
      } else if (type == "player_disconnected") {
        // Notify client
        createClientEvent("opponent_disconnected")
        return {...state}
      } else if (type == "card_played_from_hand") {
        return GameState.playCard(
          state, event.payload.socketID, event.payload.cardID, event.payload.position)
      } else if (type == "vote_new_game") {
        createClientEvent("vote_new_game", event.payload)

        return {
          ...state,
        }
      }

      return state
    }, new GameState())
  }
}
