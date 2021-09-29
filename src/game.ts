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
      return {
        ...state,
        player2: {
          hand: [],
          socketID: payload.socketID
        }
      }
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

  static drawCard(state: GameState, player1: boolean): GameState {
    const card = {...state.deck[state.deck.length-1]}
    if (!card) throw new Error("Deck ran out of cards")

    let result = {...state}
    let socketID
    if (player1 === true) {
      if (!state.player1) throw new Error("player 1 is undefined")

      socketID = state.player1.socketID

      result = {
        ...state,
        player1: {
          ...state.player1,
          hand: [
            ...state.player1.hand,
            card
          ]
        }
      }
    } else {
      if (!state.player2)
        throw new Error("player 2 is undefined")

      socketID = state.player2.socketID

      result = {
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

    return {
      ...result,
      ...GameState.createClientEvent(result, "draw_card", {
        card: card,
        socketID: socketID
      }),
      deck: state.deck.slice(0, state.deck.length-1)
    }
  }

  static fromEvents(events: GameEvent[]): GameState {
    const drawCard = (state: GameState): Card => {
      const card = state.deck.pop()
      if (!card) throw new Error("Deck ran out of cards")
      return card
    }

    const getPlayer = (state: GameState, socketID: number): Player => {
      if (state.player1 && state.player1.socketID == socketID) return state.player1
      if (state.player2 && state.player2.socketID == socketID) return state.player2

      throw new Error("Can't find player with socketID: " + socketID)
    }

    const getOpponent = (state: GameState, socketID: number): Player => {
      if (!state.player1) throw new Error("Player 1 is undefined")
      if (!state.player2) throw new Error("Player 2 is undefined")

      if (state.player1.socketID == socketID) return state.player2
      if (state.player2.socketID == socketID) return state.player1

      throw new Error("Can't find opponent for socketID: " + socketID)
    }

    return events.reduce((state: GameState, event: GameEvent): GameState => {
      state = {...state}

      const createClientEvent = (eventType: string, payload: any = {}): void => {
        state = GameState.createClientEvent(state, eventType, payload)
      }

      const type = event.event_type
      const p1 = state.player1 ? 1 : 0
      const p2 = state.player2 ? 1 : 0
      const playerCount = p1 + p2 
      if (type == "game_started") {
        return GameState.gameStarted(state, event.payload)
      } else if (type == "player_connected") {
        // Ignore if all players already set
        if (state.player1 && state.player2) return state

        if (!state.player1) {
          state = GameState.createClientEvent(state, "waiting_for_players")

          return {
            ...state,
            player1: new Player(event.payload.socketID)
          }
        }

        if (!state.player2) state.player2 = new Player(event.payload.socketID)

        // Now both players are set, so we draw their hands
        const player1 = state.player1
        const player2 = state.player2
        if (!player1) throw new Error("Player 1 is undefined")
        if (!player2) throw new Error("Player 2 is undefined")
        state = GameState.createClientEvent(state, "playing")
        state = GameState.drawCard(state, true)
        state = GameState.drawCard(state, true)
        state = GameState.drawCard(state, true)
        state = GameState.drawCard(state, false)
        state = GameState.drawCard(state, false)
        state = GameState.drawCard(state, false)

        state.playerTurn = player1.socketID

        const emissionsLineCard = drawCard(state)

        state = GameState.createClientEvent(state, "card_played_from_deck", {
          card: emissionsLineCard, position: 0
        })

        createClientEvent("player_turn", { socketID: state.playerTurn })
        createClientEvent("next_card", { card: state.deck[state.deck.length - 1] })

        return {
          ...state,
          emissionsLine: [emissionsLineCard]
        }
      } else if (type == "player_disconnected") {
        // Notify client
        createClientEvent("opponent_disconnected")
        return {...state}
      } else if (type == "card_played_from_hand") {
        const socketID = event.payload.socketID
        const cardID = event.payload.cardID
        const position = event.payload.position
        const player = getPlayer(state, socketID)
        const opponent = getOpponent(state, socketID)

        // If it is not player's turn, ignore event
        if (state.playerTurn != player.socketID) return {...state}

        // If either player's hand is empty, i.e. game is over, ignore event
        if ((state.player1 && state.player1.hand.length == 0) ||
            (state.player2 && state.player2.hand.length == 0)) {
          return {...state}
        }

        const opponentID = getOpponent(state, player.socketID).socketID
        state.playerTurn = opponentID
        createClientEvent("player_turn", { socketID: state.playerTurn })

        // Pull card from hand
        const card: Card | undefined = player.hand.find((card: Card) => card.id === cardID)
        if (!card) throw new Error(
          "Player with socketID " + socketID + " has no card with ID " + cardID
        )
        player.hand = player.hand.filter(c => c != card)

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
        // and deal new card to player
        const cardBefore = shadowedEL[position - 1]
        const cardAfter = shadowedEL[position + 1]
        if (
          (cardBefore && cardBefore.emissions > card.emissions) ||
          (cardAfter && cardAfter.emissions < card.emissions)
        ) {
          const newCard = drawCard(state)
          player.hand.push(newCard)

          createClientEvent("incorrect_card_placement", {
            cardID: card.id,
            socketID: player.socketID
          })

          createClientEvent("draw_card", {
            card: newCard,
            socketID: player.socketID
          })

          createClientEvent("next_card", {
            card: state.deck[state.deck.length - 1]
          })

          return {
            ...state,
            deck: [card, ...state.deck]
          }
        }
        
        // If card placement is correct, play card to emissions line 
        shadowedEL[position] = card

        state.emissionsLine = shadowedEL.reduce((EL: Card[], card: Card | null) => {
          if (!card) return EL

          return [
            ...EL,
            card
          ]
        }, [])

        // Notify clients that card was played correctly
        createClientEvent("card_played_from_hand", event.payload)

        // If player ran out of cards, notify clients that they won
        if (player.hand.length == 0) {
          createClientEvent("game_won", { socketID: player.socketID })
        }

        return {
          ...state,
        }
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
