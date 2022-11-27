import React from 'react'
import { ICard } from '@shared/models';
import { Menu } from './UI'
import { Page } from '../../pages/page'
import { Services } from 'pages/page-factory';

export class MenuPage implements Page {
  readonly component: React.ReactElement 
  readonly cards: ICard[]

  constructor(
    services: Services
  ) {
    this.cards = []

    this.component = <Menu
      t={services.t}
      httpServerURL={services.environment.httpServerURL}
      resolution$={services.resolution$}
      mpServer={services.mpServer}
      addEvent={services.addEvent}
    >
    </Menu>
  }
}
