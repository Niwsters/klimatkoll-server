import { EventToAdd } from "@shared/events"
import { Card } from "core/card"
import { SP_SOCKET_ID } from "core/constants"
import { drawCard, playCardFromHand } from "./events"
import { SPState } from "./sp-state"
import { spacedEmissionsLine } from "./spaced-emissions-line"

function incorrectCardPlacement(cardID: number): EventToAdd {
  return {
    event_type: "incorrect_card_placement",
    payload: { cardID },
    timestamp: Date.now()
  }
}

type NoCard = undefined | null

function isCorrectCardPlacement(
  cardBefore: Card | NoCard,
  card: Card,
  cardAfter: Card | NoCard
): boolean {
  if (cardBefore && cardBefore.emissions > card.emissions)
    return false

  if (cardAfter && cardAfter.emissions < card.emissions)
    return false

  return true
}

function cardBefore(emissionsLine: Card[], position: number): Card | NoCard {
  return spacedEmissionsLine(emissionsLine)[position-1]
}

function cardAfter(emissionsLine: Card[], position: number): Card | NoCard {
  return spacedEmissionsLine(emissionsLine)[position+1]
}

function isCorrectPlay(state: SPState, card: Card, position: number): boolean {
  return isCorrectCardPlacement(
    cardBefore(state.emissionsLine, position),
    card,
    cardAfter(state.emissionsLine, position)
  )
}

function drawCardIfExist(deck: Card[]): EventToAdd[] {
  if (deck.length === 0) return []

  return [drawCard(deck, SP_SOCKET_ID)]
}

export function playCardRequest(state: SPState, event: EventToAdd): EventToAdd[] {
  const card = state.hand.find(c => c.id === event.payload.cardID)
  if (!card) return []

  switch (isCorrectPlay(state, card, event.payload.position)) {
    case true:
      return [
        playCardFromHand(event.payload.cardID, event.payload.position),
        ...drawCardIfExist(state.deck)
      ]
    case false:
      return [
        incorrectCardPlacement(card.id),
        ...drawCardIfExist(state.deck)
      ]
  }
}
