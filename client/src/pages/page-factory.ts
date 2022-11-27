import { Page } from '../pages/page'
import { MenuPage } from '../pages/menu'
import { MPGamePage } from './multiplayer'
import { SinglePlayerPage } from './singleplayer'

import { EventToAdd } from '../event/event'
import { EventStream } from '../event/event-stream'
import { Canvas } from '../canvas/canvas'
import { Resolution } from '../root'
import { Environment } from '../root/environment'
import { Stream } from '../stream'
import { Inbox } from 'inbox'

export type PageType = "multiplayer" | "singleplayer" | "menu";

export type Services = {
  environment: Environment,
  addEvent: (e: EventToAdd) => void,
  resolution$: Stream<Resolution>,
  events$: EventStream,
  canvas: Canvas,
  socketID: number,
  mpServer: Inbox<EventToAdd>,
  t: (key: string) => string
}

export class PageFactory {
  private readonly services: Services

  constructor(services: Services) {
    this.services = services
  }

  private menuPage() {
    return new MenuPage(this.services)
  }

  private multiPlayerPage() {
    const { addEvent, resolution$, socketID, events$, t } = this.services
    return new MPGamePage(addEvent, resolution$, socketID, t ,events$)
  }

  private singlePlayerPage() {
    return new SinglePlayerPage(this.services)
  }

  get(page: PageType): Page {
    switch (page) {
      case "multiplayer":
        return this.multiPlayerPage()
      case "singleplayer":
        return this.singlePlayerPage()
      case "menu":
        return this.menuPage()
      default:
        throw new Error(`No page mapped to ${page}`)
    }
  }
}
