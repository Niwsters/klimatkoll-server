import seedrandom from 'seedrandom'
import cardData, { Card, CardData } from './cards'
let lastCardID = 0
const cards = cardData.map((card: CardData) => {
  return {
    ...card,
    id: lastCardID++
  }
})

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
  emissionsLine: Card[] = []
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

    const getPlayer = (state: GameState, socketID: number): Player => {
      if (state.player1 && state.player1.socketID == socketID) return state.player1
      if (state.player2 && state.player2.socketID == socketID) return state.player2

      throw new Error("Can't find player with socketID: " + socketID)
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

        const emissionsLineCard = drawCard(state)

        return {
          ...state,
          emissionsLine: [emissionsLineCard],
          clientEvents: [
            ...state.clientEvents,
            createClientEvent("playing"),
            ...state.player1.hand.map((card: Card) => {
              return createClientEvent("draw_card", { card: card, socketID: player1.socketID })
            }),
            ...state.player2.hand.map((card: Card) => {
              return createClientEvent("draw_card", { card: card, socketID: player2.socketID })
            }),
            createClientEvent("card_played_from_deck", { card: emissionsLineCard, position: 0 })
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
      } else if (type == "card_played_from_hand") {
        const socketID = event.payload.socketID
        const cardID = event.payload.cardID
        const position = event.payload.position
        const player = getPlayer(state, socketID)
        const card = player.hand.find((card: Card) => card.id === cardID)

        if (!card) throw new Error(
          "Player with socketID " + socketID + " has no card with ID " + cardID
        )

        // Position works like this: [s,0,s,1,s,2,s] where s is a "shadow card" where
        // card can be placed, and 0,1,2 are card indexes in the emissions line
        const shadowedEL = state.emissionsLine.reduce((shadowedEL: (Card | null)[], card: Card) => {
          return [
            ...shadowedEL,
            card,
            null
          ]
        }, [null])
        const cardBefore = shadowedEL[position - 1]
        const cardAfter = shadowedEL[position + 1]
        if (
          (cardBefore && cardBefore.emissions > card.emissions) ||
          (cardAfter && cardAfter.emissions < card.emissions)
        ) {
          return {
            ...state,
            clientEvents: [
              ...state.clientEvents,
              createClientEvent("incorrect_card_placement")
            ]
          }
        }

        shadowedEL[position] = card

        state.emissionsLine = shadowedEL.reduce((EL: Card[], card: Card | null) => {
          if (!card) return EL

          return [
            ...EL,
            card
          ]
        }, [])

        return {
          ...state,
          clientEvents: [
            ...state.clientEvents,
            createClientEvent("card_played_from_hand", event.payload)
          ]
        }
      }

      return state
    }, new GameState())
  }
}
