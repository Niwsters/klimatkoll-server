import React from 'react'
import { Card } from 'core/card';
import { Game } from 'core/game';
import { StatusBar } from './UI';
import { Page } from '../../pages/page'
import { AddEventFunc } from '@shared/models';
import { Resolution } from 'root';
import { Stream } from '../../stream'
import { Event } from '@shared/events';

export class MPGamePage implements Page {
  readonly component: React.ReactElement 

  private readonly game: Game

  constructor(
    addEvent: AddEventFunc,
    resolution$: Stream<Resolution>,
    socketID: number,
    t: (key: string) => string,
    events$: Stream<Event>
  ) {
    this.game = new Game(socketID, t)
    this.game.events$.subscribe(addEvent)

    events$.subscribe(event => {
      this.game.handleEvent(event)
    })

    setInterval(() => {
      this.game.update(Date.now())
    }, 1000/60)

    this.component = <StatusBar
      gamestate={this.game.state}
      addEvent={addEvent}
      resolution$={resolution$}
      t={t}
    ></StatusBar>
  }

  get cards(): Card[] {
    return this.game.state.cards
  }
}
