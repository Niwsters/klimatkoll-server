import { Root } from '../root'
import { MultiPlayerServer } from '../socket/multiplayer-server'
import { EventToAdd } from '../event/event'
import { useState } from 'react'
import { Menu } from '../pages/menu/UI/Menu'
import * as Canvas from '../components/Canvas'
import { TFunction } from 'i18next'
import * as SampleCards from '../stories/sample_cards'

export type Page = "menu" | "canvas"

export function Router(props: { mpServer: MultiPlayerServer, root: Root, t: TFunction }) {
  const { mpServer, root, t } = props

  const route = (event: EventToAdd) => {
    switch (event.event_type) {
      case "singleplayer_started":
        return "canvas"
      default:
        return "menu"
    }
  }

  const [page, setPage] = useState<Page>("menu")
  const onEvent = (event: EventToAdd) => {
    setPage(route(event))
  }

  const menu = <Menu
    httpServerURL={root.environment.httpServerURL}
    resolution$={root.resolution$}
    mpServer={mpServer.inbox}
    addEvent={onEvent}
    t={t}
    />

  const getCards: Canvas.GetCards = () => []
  const getCardDesign: Canvas.GetCardDesign = (_name: string) => SampleCards.card
  const canvas = <Canvas.Component
    getCards={getCards}
    getCardDesign={getCardDesign}
    />

  const component = (route: Page) => {
    switch (route) {
      case "menu":
        return menu
      case "canvas":
        return canvas
    }
  }

  return (
    <div id="klimatkoll-inner">
      { component(page) }
    </div>
  )
}
