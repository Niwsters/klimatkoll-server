import { Canvas } from './Canvas'
import { CardDesign } from "../core/card_design"
import { PlayedCard } from '../core/play_card'
import { init, playCards, score as getScore } from '../core/singleplayer'
import { SPUI } from './SPUI'
import { WIDTH } from '../core/constants'
import { TFunction } from '../tfunction'
import { Navigate } from './navigate'
import { useState } from 'react'

export type Props = {
  designs: CardDesign[]
  t: TFunction
  navigate: Navigate
}

export const SinglePlayer = (props: Props): React.ReactElement => {
  let { designs, t, navigate } = props
  let piles = init(designs)
  let [score, setScore] = useState(0)

  const onCardsPlayed = (playedCards: PlayedCard[]) => {
    piles = playCards(piles, designs, playedCards)
    setScore(getScore(piles))
  } 

  return <div style={{ width: WIDTH }}>
    <Canvas
      designs={designs}
      getPiles={() => piles}
      onCardsPlayed={onCardsPlayed}
      />
    <SPUI t={t} onLeaveGame={() => navigate("menu")} score={score} />
  </div>
}
/*
import * as Card from '../../core/card'
import { CardDesign } from '../../core/card_design'
import { BasicGame } from '../BasicGame'
import { ServerCard } from 'components/App/fetch-cards'
import { equijoin } from '../../util'
import { SPUI } from './ui'
import { TFunction } from 'tfunction'

const positioning: Card.Positioning = {
  x: 0,
  y: 0,
  rotation: 0,
  scale: 1,
  zLevel: 0
}

export type Props = {
  cards: ServerCard[],
  t: TFunction,
  onLeaveGame: () => void
}

export const SinglePlayer = (props: Props) => {
  const { cards, t, onLeaveGame } = props

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
    board = Board.drawHandCard(board, currentTime)
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
  board = Board.shuffleDeck(board)
  board = Board.drawHandCard(board, currentTime)
  board = Board.playCardFromDeck(board, currentTime)

  const onBoardUpdate = (b: Board.Board) => board = b

  const style = {
    position: "relative",
    fontFamily: "Poppins"
  } as const
  return <div style={style}>
    <BasicGame
      board={() => board}
      onCardPlayRequested={onCardPlayRequested}
      onBoardUpdate={onBoardUpdate}
      cardDesigns={cardDesigns}
      />
    <SPUI
      t={t}
      onLeaveGame={onLeaveGame}
      />
  </div>
}
*/
