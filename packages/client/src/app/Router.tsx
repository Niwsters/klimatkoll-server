import { Root } from '../root'
import { MultiPlayerServer } from '../socket/multiplayer-server'
import { EventToAdd } from '../event/event'
import { useState } from 'react'
import { Menu } from '../pages/menu/UI/Menu'
import { BasicGame } from '../components/BasicGame'
import { TFunction } from 'i18next'
import * as Board from '../core2/board'
import * as Card from '../core2/card'
import * as SampleCards from '../stories/sample_cards'

export type Page = "menu" | "canvas"

const positioning: Card.CardPositioning = {
  x: 0,
  y: 0,
  rotation: 0,
  scale: 1,
  zLevel: 0
}

const card = Card.create(SampleCards.card.name, positioning)
const card2 = Card.create(SampleCards.card2.name, positioning)
const card3 = Card.create(SampleCards.card3.name, positioning)
const deck = [card, card2, card3]

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

  const onGameEvent = (event: EventToAdd) => console.log(event)

  const currentTime = Date.now()
  
  let board = Board.create([...deck, ...deck])
  board = Board.drawHandCard(board, currentTime)
  board = Board.drawHandCard(board, currentTime)
  board = Board.drawHandCard(board, currentTime)

  board = Board.playCardFromDeck(board, currentTime)
  board = Board.playCardFromDeck(board, currentTime)
  board = Board.playCardFromDeck(board, currentTime)
  const singleplayer = <BasicGame
    board={board}
    onEvent={onGameEvent}
    />

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
