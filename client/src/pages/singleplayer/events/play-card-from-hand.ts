import { EventToAdd } from "@shared/events";
import { SP_SOCKET_ID } from "core/constants";

export function playCardFromHand(cardID: number, position: number): EventToAdd {
  return {
    event_type: "card_played_from_hand",
    payload: { cardID: cardID, socketID: SP_SOCKET_ID, position: position },
    timestamp: Date.now()
  }
}
