import seedrandom from 'seedrandom'
import cards, { Card } from './cards'

export interface GameEvent {
  event_id: number
  event_type: string
  payload: any
}

export class GameState {
  player1?: Player
  player2?: Player
  deck: Card[] = [...cards]
  clientEvents: GameEvent[] = []
}

export class Player {
  socketID: number
  hand: Card[] = []

  constructor(socketID: number) {
    this.socketID = socketID
  }
}

export class EventHandler {
  static lastServerEventID: number = 0

  static createEvent(eventID: number, type: string, payload: any = {}): GameEvent {
    return {
      event_id: eventID,
      event_type: type,
      payload: payload
    }
  }

  static createServerEvent(type: string, payload: any = {}): GameEvent {
    return EventHandler.createEvent(EventHandler.lastServerEventID++, type, payload)
  }

  static getServerState(events: GameEvent[]): GameState {
    const drawCard = (state: GameState): Card => {
      const card = state.deck.pop()
      if (!card) throw new Error("Deck ran out of cards")
      return card
    }

    let lastClientEventID: number = 0
    const createClientEvent = (eventType: string, payload: any = {}): GameEvent => {
      return EventHandler.createEvent(lastClientEventID++, eventType, payload)
    }

    return events.reduce((state: GameState, event: GameEvent): GameState => {
      state = {...state}
      const type = event.event_type
      const p1 = state.player1 ? 1 : 0
      const p2 = state.player2 ? 1 : 0
      const playerCount = p1 + p2

      if (type == "player_connected") {
        // Ignore if all players already set
        if (state.player1 && state.player2) return state

        if (!state.player1) return {
          ...state,
          player1: new Player(event.payload.socketID),
          clientEvents: [
            ...state.clientEvents,
            createClientEvent("waiting_for_players")
          ]
        }

        if (!state.player2) state.player2 = new Player(event.payload.socketID)

        // Now both players are set, so we draw their hands
        const player1 = state.player1
        const player2 = state.player2
        if (!player1) throw new Error("Player 1 is undefined")
        if (!player2) throw new Error("Player 2 is undefined")
        state.player1.hand = [0,0,0].map(() => drawCard(state))
        state.player2.hand = [0,0,0].map(() => drawCard(state))

        return {
          ...state,
          clientEvents: [
            ...state.clientEvents,
            createClientEvent("playing"),
            ...state.player1.hand.map((card: Card) => {
              return createClientEvent("draw_card", { card: card, socketID: player1.socketID })
            }),
            ...state.player2.hand.map((card: Card) => {
              return createClientEvent("draw_card", { card: card, socketID: player2.socketID })
            })
          ]
        }
      } else if (type == "player_disconnected") {
        // Notify client
        return {
          ...state,
          clientEvents: [
            ...state.clientEvents,
            createClientEvent("opponent_disconnected")
          ]
        }
      }

      return state
    }, new GameState())
  }
}
