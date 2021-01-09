import seedrandom from 'seedrandom'
import cards from './cards'

export interface Event {
  event_id: number
  event_type: string
  payload: any
}
 
let last_event_id = 0
export function createEvent(type: string, payload: any = {}): Event {
  return {
    "event_id": last_event_id++,
    "event_type": type,
    "payload": payload
  }
}

export function getClientEvents(events: Event[], socketID: string): Event[] {
  let deck = cards
  const players = new Map()

  return events.reduce((clientEvents: Event[], event: Event) => {
    const type = event.event_type

    if (type == "player_connected") {
      // Assign player and draw hand
      const card = deck.pop()
      players.set(event.payload.socketID, { hand: [card] })

      if (event.payload.socketID == socketID) {
        return [...clientEvents, createEvent("draw_card", { card: card })]
      }

      return [...clientEvents, createEvent("draw_opponent_card", { card: card })]
    } else if (type == "player_disconnected") {
      const player = players.get(event.payload.socketID)

      // Return hand to deck
      deck = [
        ...player.hand,
        ...deck
      ]

      // Unassign player
      players.delete(event.payload.socketID)

      return [...clientEvents, createEvent("return_opponent_hand")]
    }

    return clientEvents
  }, [])
}
