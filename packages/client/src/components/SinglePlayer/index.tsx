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

  const currentTime = Date.now()

  const onCardPlayRequested = (event: Board.CardPlayRequestedEvent) => {
    const { cardID, position } = event.payload
    board = Board.playCardFromHand(board, cardID, Date.now(), position)
  }

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

  const deck: Card.Card[] = cards.map(card => {
    return Card.create(card.name, positioning)
  })

  let board = Board.create(deck)
  board = Board.drawHandCard(board, currentTime)
  board = Board.playCardFromDeck(board, currentTime)

  const onBoardUpdate = (b: Board.Board) => board = b

  return <BasicGame
    board={() => board}
    onCardPlayRequested={onCardPlayRequested}
    onBoardUpdate={onBoardUpdate}
    cardDesigns={cardDesigns}
    />
}
