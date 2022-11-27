import { EventToAdd } from "@shared/events"
import { Card } from "core/card"

export function playCardFromDeck(cards: Card[]): EventToAdd {
  const cardIndex = 0
  return {
    event_type: "card_played_from_deck",
    payload: { card: cards[cardIndex] },
    timestamp: Date.now()
  }
}
