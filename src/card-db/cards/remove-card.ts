import { Database } from "sqlite3";
import { Event, insertEvent } from "../events";
import { Card } from "./card";

function cardRemovedEvent(id: string): Event {
  return {
    type: "card_removed",
    payload: { id }
  }
}

export function card_removed(cards: Card[], event: Event): Card[] {
  return cards.filter(c => c.id !== event.payload.id)
}

export async function removeCard(db: Database, id: string) {
  await insertEvent(db, "card", cardRemovedEvent(id))  
}
