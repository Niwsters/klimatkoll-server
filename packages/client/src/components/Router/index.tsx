import { Root } from '../../root'
import { MultiPlayerServer } from '../../socket/multiplayer-server'
import { EventToAdd } from '../../event/event'
import { useState } from 'react'
import { Menu } from '../../pages/menu/UI/Menu'
import { TFunction } from 'i18next'
import { SinglePlayer } from '../../components/SinglePlayer'
import { ServerCard } from 'components/App/fetch-cards'

export type Page = "menu" | "canvas"

export type Props = {
  mpServer: MultiPlayerServer,
  root: Root,
  t: TFunction,
  cards: ServerCard[]
}

export function Router(props: Props) {
  const { mpServer, root, t, cards } = props

  const route = (event: EventToAdd) => {
    switch (event.event_type) {
      case "singleplayer_started":
        return "canvas"
      default:
        return "menu"
    }
  }

  const [page, setPage] = useState<Page>("menu")
  const onMenuEvent = (event: EventToAdd) => {
    setPage(route(event))
  }

  const menu = <Menu
    httpServerURL={root.environment.httpServerURL}
    resolution$={root.resolution$}
    mpServer={mpServer.inbox}
    addEvent={onMenuEvent}
    t={t}
    />

  const singleplayer = <SinglePlayer cards={cards} />
  const component = (route: Page) => {
    switch (route) {
      case "menu":
        return menu
      case "canvas":
        return singleplayer
    }
  }

  return (
    <div id="klimatkoll-inner">
      { component(page) }
    </div>
  )
}
