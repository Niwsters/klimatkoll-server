import { EventToAdd } from "@shared/events";
import { Card, createCard } from "core/card";
import { SP_SOCKET_ID } from "core/constants";
import { fetchCardData } from "shared/fetch-card-data";
import { StreamChannel } from "../../stream";
import { playCardFromDeck } from "./events";
import { drawCard } from './events/draw-card'
import { SPState } from './sp-state'
import { getCommands, NO_EVENT } from './get-commands'
import { getState } from './get-state'

async function getCards(baseUrl: string): Promise<Card[]> {
  const cardData = await fetchCardData(baseUrl)

  return cardData.map((c, i) => createCard({...c, id: i })).slice(0, 11)
}

function shuffle(deck: Card[]): Card[] {
  deck = deck.slice()
  const random = () => Math.random()

  for (let i = deck.length - 1; i > 0; i--) {
    var j = Math.floor(random() * (i + 1));
    var temp = deck[i];
    deck[i] = deck[j];
    deck[j] = temp;
  }

  return deck
}

export class SPServer {
  readonly events$: StreamChannel<EventToAdd> = new StreamChannel()

  private state: SPState = {
    deck: [],
    emissionsLine: [],
    hand: []
  }

  private setDeck(deck: Card[]) {
    this.state = {
      ...this.state,
      deck
    }
  }

  async fetchDeck(baseUrl: string) {
    this.setDeck(shuffle(await getCards(baseUrl)))
    this.events$.next(drawCard(this.deck, SP_SOCKET_ID))
    this.events$.next(playCardFromDeck(this.deck))
  }

  get deck(): Card[] {
    return this.state.deck
  }

  get spState(): SPState {
    return this.state
  }

  handleEvent(event: EventToAdd) {
    this.state = getState(this.state, event)

    const result = getCommands(this.state, event)
    if (result !== NO_EVENT) {
      result.forEach(event => this.events$.next(event))
    }
  }
}
