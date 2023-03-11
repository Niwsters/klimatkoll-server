import { EventToAdd } from '../../event/event'
import * as Board from '../../core2/board'
import * as Card from '../../core2/card'
import { CardDesign } from '../../core2/card_design'
import { BasicGame } from '../BasicGame'
import { ServerCard } from 'components/App/fetch-cards'

const positioning: Card.CardPositioning = {
  x: 0,
  y: 0,
  rotation: 0,
  scale: 1,
  zLevel: 0
}

export type Props = {
  cards: ServerCard[]
}

export function SinglePlayer(props: Props) {
  const { cards } = props

  const onGameEvent = (event: EventToAdd) => console.log(event)
  const currentTime = Date.now()

  let cardDesigns: CardDesign[] = cards

  const space: CardDesign = {
    name: "space",
    title: "",
    subtitle: "",
    emissions: 0,
    descr_front: "",
    descr_back: "",
    duration: "",
    bg_color_back: "",
    bg_color_front: ""
  }

  cardDesigns = [...cardDesigns, space]

  const getCardDesign = (name: string) => {
    const card = cardDesigns.find(card => card.name === name)
    if (card === undefined) throw new Error(`Can't find card design with name: ${name}`)
    return card
  }

  const deck: Card.Card[] = cards.map(card => {
    return Card.create(card.name, positioning)
  })

  let board = Board.create(deck)
  board = Board.drawHandCard(board, currentTime)
  board = Board.playCardFromDeck(board, currentTime)

  return <BasicGame
    board={board}
    onEvent={onGameEvent}
    getCardDesign={getCardDesign}
    />
}
