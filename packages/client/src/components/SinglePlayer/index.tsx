import { EventToAdd } from '../../event/event'
import * as Board from '../../core2/board'
import * as Card from '../../core2/card'
import * as SampleCards from '../../stories/sample_cards'
import { BasicGame } from '../BasicGame'

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

export function SinglePlayer() {
  const onGameEvent = (event: EventToAdd) => console.log(event)

  const currentTime = Date.now()
  
  let board = Board.create([...deck, ...deck])
  board = Board.drawHandCard(board, currentTime)
  board = Board.drawHandCard(board, currentTime)
  board = Board.drawHandCard(board, currentTime)

  board = Board.playCardFromDeck(board, currentTime)
  board = Board.playCardFromDeck(board, currentTime)
  board = Board.playCardFromDeck(board, currentTime)

  return <BasicGame
    board={board}
    onEvent={onGameEvent}
    />
}
