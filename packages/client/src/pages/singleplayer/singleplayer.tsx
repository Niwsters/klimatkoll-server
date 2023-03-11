import { EventToAdd } from "@shared/events";
import { Card } from "core/card";
import { Game } from "core/game";
import React from "react";
import { SPServer } from './server'
import { SP_SOCKET_ID } from "core/constants";
import { SPUI } from './ui/spui'

function leaveGame(): EventToAdd {
  return {
    event_type: "singleplayer_left_game",
    payload: {},
    timestamp: Date.now()
  }
}

export class SinglePlayerPage {
  private game: Game
  private server: SPServer = new SPServer()
  private readonly socketID: number = SP_SOCKET_ID
  private readonly services: any 

  component: React.ReactElement;

  constructor(services: any) {
    this.services = services
    this.services.events$.subscribe(event => this.addEvent(event))

    this.game = new Game(this.socketID, services.t)
    this.game.events$.subscribe(this.onGameEvent.bind(this))

    this.server.events$.subscribe(this.onServerEvent.bind(this))

    setInterval(() => this.game.update(Date.now()), 1000/60)

    this.getCards(`${services.environment.httpServerURL}/${services.environment.language}`)

    this.component = <SPUI
      getState={() => this.server.spState}
      leaveGame={this.leaveGame.bind(this)}
      t={this.services.t}
    />
  }

  private leaveGame() {
    this.services.addEvent(leaveGame())
  }

  private onServerEvent(event: EventToAdd) {
    this.addEvent(event)
  }

  private onGameEvent(event: EventToAdd) {
    this.addEvent(event)
  }

  private async getCards(baseUrl: string) {
    await this.server.fetchDeck(baseUrl)
  }

  private addEvent(event: EventToAdd) {
    this.game.handleEvent(event as any)
    this.server.handleEvent(event)
  }

  get cards(): Card[] {
    return [
      ...this.game.state.cards
    ]
  }
}
