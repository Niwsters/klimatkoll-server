import { EventToAdd } from "@shared/events"
import { Card } from "core/card"

export function drawCard(cards: Card[], socketID: number): EventToAdd {
  const cardIndex = 0
  return {
    event_type: "draw_card",
    payload: { card: cards[cardIndex], socketID },
    timestamp: Date.now()
  }
}
