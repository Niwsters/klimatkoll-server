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

  static consumeResponses(oldGame: GameState): [GameState, SocketResponse[]] {
    let game = {...oldGame}
    const c1r = GameState.getPlayer1Responses(game)
    const c2r = GameState.getPlayer2Responses(game)
    game.clientEvents = []
    return [game, [...c1r, ...c2r]]
  }

  static call(game: GameState, event: SocketEvent): GameState {
    return (GameState as any)[event.type](game, event.payload)
  }

  static delegate(oldGame: GameState, event: SocketEvent): [GameState, SocketResponse[]] {
    let game = {...oldGame}
    game = GameState.call(game, event);
    return GameState.consumeResponses(game);
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

  static addPlayer2(oldState: GameState, socketID: number) {
    return {
      ...oldState,
      player2: {
        hand: [],
        socketID: socketID
      }
    }
  }

  static playerConnected(oldState: GameState, payload: any) {
    let state = {...oldState}

    if (state.player2 !== undefined)
      return {...state}

    state = GameState.addPlayer2(state, payload.socketID)

    const player1 = state.player1
    const player2 = state.player2 as Player
    state = GameState.createClientEvent(state, "room_joined", { roomID: state.roomID })
    state = GameState.createClientEvent(state, "playing")
    state = GameState.drawCards(state, player1.socketID, 3)
    state = GameState.drawCards(state, player2.socketID, 3)
    state = GameState.setPlayerTurn(state, player1.socketID)
    state = GameState.playCardFromDeck(state)

    return state
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

  static drawCards(oldState: GameState, socketID: number, count: number): GameState {
    let state = {...oldState}
    for (let i=0; i<count; i++)
      state = GameState.drawCard(state, socketID)
    return state
  }

  static giveCardToPlayer(oldState: GameState, card: Card, playerNumber: 1 | 2): GameState {
    let state = {...oldState}
    const player = (state as any)['player' + playerNumber];
    return {
      ...state,
      ['player' + playerNumber]: {
        ...player,
        hand: [
          ...player.hand,
          card
        ]
      }
    }
  }

  static getPlayerNumber(state: GameState, socketID: number): 1 | 2 {
    if (state.player1.socketID === socketID)
      return 1
    else if (state.player2 && state.player2.socketID === socketID)
      return 2

    throw new Error(`Player with socketID ${socketID} is not in the game`)
  }

  static getNextCard(state: GameState): Card {
    return {...state.deck[state.deck.length-1]}
  }

  static drawNextCard(oldState: GameState): [GameState, Card] {
    let state = {...oldState}

    if (state.deck.length === 0) throw new Error("Deck ran out of cards");

    const card = {...state.deck[state.deck.length-1]}
    state.deck = state.deck.slice(0, state.deck.length - 1)

    state = GameState.createClientEvent(state, "next_card", {
      card: GameState.getNextCard(state)
    })

    return [state, card]
  }

  static drawCard(oldState: GameState, socketID: number): GameState {
    let state = {...oldState}
    let card: Card;

    [state, card] = GameState.drawNextCard(state)
    state = GameState.giveCardToPlayer(state, card, GameState.getPlayerNumber(state, socketID))

    state = GameState.createClientEvent(state, "draw_card", {
      card: card,
      socketID: socketID
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

    let card: Card;
    [state, card] = GameState.drawNextCard(state);

    const emissionsLine = [card]

    state = GameState.createClientEvent(state, "card_played_from_deck", {
      card: card,
      position: 0
    })

    return {
      ...state,
      emissionsLine: emissionsLine
    }
  }

  static playCard(oldState: GameState, socketID: number, cardID: number, position: number): GameState {
    return GameState.play_card_request(oldState, { socketID, cardID, position })
  }

  static pullCardFromPlayer(oldState: GameState, cardID: number, playerNumber: number): [GameState, Card] {
    let state = {...oldState}

    const player = (state as any)['player' + playerNumber];
    const card = player.hand.find((c: Card) => c.id === cardID)

    if (!card) throw new Error(`Player ${playerNumber} does not have card with ID: ${cardID}`)

    state = {
      ...oldState,
      ['player' + playerNumber]: {
        ...player,
        hand: player.hand.filter((c: Card) => c.id !== cardID)
      }
    }

    return [state, card]
  }

  static isGameOver(state: GameState): boolean {
    if (!state.player2)
      throw new Error("Player 2 is undefined")

    return state.player1.hand.length === 0 ||
           state.player2.hand.length === 0
  }

  static isPlayersTurn(state: GameState, socketID: number): boolean {
    return (state.player1.socketID === socketID && state.playerTurn === state.player1.socketID) ||
           (state.player2 !== undefined && state.player2.socketID === socketID && state.playerTurn === state.player2.socketID)
  }

  static getShadowedEmissionsLine(state: GameState): (Card | null)[] {
    return state.emissionsLine.reduce((shadowedEL: (Card | null)[], card: Card) => {
      return [
        ...shadowedEL,
        card,
        null
      ]
    }, [null])
  }

  static isPlacementCorrect(state: GameState, card: Card, position: number): boolean {
    const shadowedEL = GameState.getShadowedEmissionsLine(state)
    const cardBefore = shadowedEL[position - 1]
    const cardAfter = shadowedEL[position + 1]

    return (!cardBefore || cardBefore.emissions <= card.emissions) &&
           (!cardAfter || cardAfter.emissions >= card.emissions)
  }

  static playCardFromHand(oldState: GameState, card: Card, position: number, socketID: number): GameState {
    let state = {...oldState}

    const shadowedEL = GameState.getShadowedEmissionsLine(state)
    shadowedEL[position] = card

    state = GameState.createClientEvent(state, "card_played_from_hand", {
      cardID: card.id, position: position, socketID: socketID
    })

    state.emissionsLine = shadowedEL.reduce((EL: Card[], card: Card | null) => {
      if (!card) return EL

      return [
        ...EL,
        card
      ]
    }, [])

    return state
  }

  static didPlayerWin(state: GameState, socketID: number): boolean {
    const player = GameState.getPlayer(state, socketID)
    return player.hand.length === 0
  }

  static checkWinCondition(oldState: GameState, socketID: number): GameState {
    let state = {...oldState}

    if (GameState.didPlayerWin(state, socketID)) {
      return GameState.createClientEvent(state, "game_won", {
        socketID: socketID
      })
    }

    return state
  }

  static incorrectCardPlacement(oldState: GameState, card: Card, socketID: number): GameState {
    let state = {...oldState}

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

  static play_card_request(oldState: GameState, payload: any): GameState {
    let state = {...oldState}
    let card: Card

    const socketID = payload.socketID
    const cardID = payload.cardID
    const position = payload.position

    if (GameState.isGameOver(state)) return state;
    if (!GameState.isPlayersTurn(state, socketID)) return state;

    [state, card] = GameState.pullCardFromPlayer(state, cardID, GameState.getPlayerNumber(state, socketID));
    state = GameState.setPlayerTurn(state, GameState.getOpponent(state, socketID).socketID)

    if (!GameState.isPlacementCorrect(state, card, position))
      return GameState.incorrectCardPlacement(state, card, socketID)

    state = GameState.playCardFromHand(state, card, position, socketID)
    state = GameState.checkWinCondition(state, socketID)

    return state
  }

  static leave_game(state: GameState): GameState {
    return state
  }

  static playerDisconnected(state: GameState, payload: any): GameState {
    return GameState.createClientEvent(state, "opponent_disconnected")
  }
}
