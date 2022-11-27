import { EventToAdd } from "@shared/events"
import { Card } from "core/card"
import { SPState } from "./sp-state"
import { insertCardIntoEmissionsLine } from './spaced-emissions-line'

function drawCard(state: SPState, event: EventToAdd): SPState {
  return {
    ...removeCardFromDeck(state, event.payload.card),
    hand: [...state.hand, event.payload.card]
  }
}

function removeCardFromDeck(state: SPState, card: Card): SPState {
  return {
    ...state,
    deck: state.deck.filter(c => c.id !== card.id)
  }
}

function removeCardFromHand(state: SPState, card: Card): SPState {
  return {
    ...state,
    hand: state.hand.filter(c => c.id !== card.id)
  }
}

function playCardToEmissionsLine(state: SPState, card: Card, position: number): SPState {
  return {
    ...state,
    emissionsLine: insertCardIntoEmissionsLine(state.emissionsLine, card, position)
  }
}

function cardPlayedFromDeck(state: SPState, _: EventToAdd): SPState {
  const card = state.deck[0]

  return playCardToEmissionsLine(
    removeCardFromDeck(state, card),
    card,
    0
  )
}

function cardPlayedFromHand(state: SPState, event: EventToAdd): SPState {
  const card = state.hand.find(c => c.id === event.payload.cardID)

  if (!card) return {...state}

  return playCardToEmissionsLine(
    removeCardFromHand(state, card),
    card,
    event.payload.position
  )
}

function incorrectCardPlacement(state: SPState, event: EventToAdd): SPState {
  const card = state.hand.find(c => c.id === event.payload.cardID)
  if (!card) return {...state}
  return removeCardFromHand(state, card)
}

export function getState(state: SPState, event: EventToAdd): SPState {
  switch (event.event_type) {
    case "draw_card":
      return drawCard(state, event)
    case "card_played_from_deck":
      return cardPlayedFromDeck(state, event)
    case "card_played_from_hand":
      return cardPlayedFromHand(state, event)
    case "incorrect_card_placement":
      return incorrectCardPlacement(state, event) 
    default:
      return state
  }
}
