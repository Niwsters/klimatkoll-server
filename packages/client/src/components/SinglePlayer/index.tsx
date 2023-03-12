import * as Board from '../../core2/board'
import * as Card from '../../core2/card'
import { CardDesign } from '../../core2/card_design'
import { BasicGame } from '../BasicGame'
import { ServerCard } from 'components/App/fetch-cards'
import { equijoin } from '../../util'

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

  const cardEmissions = cards.map(c => ({ name: c.name, emissions: c.emissions }))
  const isCorrectPlacement = (board: Board.Board, cardName: string, position: number) => {
    const card = cardEmissions.find(c => c.name === cardName)
    if (card === undefined) return

    const cards = equijoin(board.emissionsLine.cards, cardEmissions, a => a.name, b => b.name)
      .sort((a,b) => a.emissions - b.emissions)

    const leftCard = cards[position]
    const rightCard = cards[position+1]

    return (leftCard === undefined || leftCard.emissions <= card.emissions) &&
           (rightCard === undefined || card.emissions <= rightCard.emissions)
  }

  const onCardPlayRequested = (event: Board.CardPlayRequestedEvent) => {
    const { cardName, position } = event.payload
    const currentTime = event.timestamp

    board = isCorrectPlacement(board, cardName, position)
      ? Board.playCardFromHand(board, cardName, currentTime, position)
      : Board.discardCard(board, cardName, currentTime)
  }

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
  const cardDesigns: CardDesign[] = [...cards, space]

  const deck: Card.Card[] = cards.map(card => Card.create(card.name, positioning))

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
