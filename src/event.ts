import seedrandom from 'seedrandom'
import cards, { Card } from './cards'

export interface GameEvent {
  event_id: number
  event_type: string
  payload: any
}

export class EventHandler {
  static lastServerEventID: number = 0
  static deck: Card[] = cards

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

  static getClientEvents(events: GameEvent[], socketID: number): GameEvent[] {
    const players = new Map()

    let lastClientEventID: number = 0
    const createClientEvent = (eventType: string, payload: any = {}) => {
      return EventHandler.createEvent(lastClientEventID++, eventType, payload)
    }

    // Client event IDs need to be the same every time, so we need to reset counter
    return events.reduce((clientEvents: GameEvent[], event: GameEvent) => {
      const type = event.event_type

      if (type == "player_connected") {
        if (players.size >= 2) return clientEvents

        // Assign player and draw hand
        const card = EventHandler.deck.pop()
        players.set(event.payload.socketID, { hand: [card] })

        if (event.payload.socketID == socketID) {
          return [...clientEvents, createClientEvent("draw_card", { card: card })
          ]
        }

        return [...clientEvents, createClientEvent("draw_opponent_card", { card: card })]
      } else if (type == "player_disconnected") {
        const player = players.get(event.payload.socketID)

        // Return hand to deck
        EventHandler.deck = [
          ...player.hand,
          ...EventHandler.deck
        ]

        // Unassign player
        players.delete(event.payload.socketID)

        return [...clientEvents, createClientEvent("return_opponent_hand")]
      }

      return clientEvents
    }, [])
  }
}
