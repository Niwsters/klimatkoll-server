import _React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import * as Canvas from '../components/Canvas'
import * as Board from '../core2/board'
import * as SampleCards from './sample_cards'
import * as EL from '../core2/emissions_line'
import * as Card from '../core2/card'
import { BasicGame } from '../components/BasicGame'
import { EventToAdd } from '@shared/events'
import { cardDesigns } from './sample_cards'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Canvas/Board',
  component: Canvas.Component
} as ComponentMeta<typeof Canvas.Component>;

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

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof BasicGame> = (args) => <BasicGame {...args} cardDesigns={cardDesigns} />;

function handBoard(): Board.Board {
  const currentTime = Date.now()

  let board = Board.create(deck)
  board = Board.drawHandCard(board, currentTime)
  board = Board.drawHandCard(board, currentTime)
  board = Board.drawHandCard(board, currentTime)
  return board
}

export const Hand = Template.bind({});
Hand.args = {
  board: handBoard()
};

function elBoard(): Board.Board {
  const currentTime = Date.now()

  let board = Board.create(deck)
  board = Board.playCardFromDeck(board, currentTime)
  board = Board.playCardFromDeck(board, currentTime)
  board = Board.playCardFromDeck(board, currentTime)
  return board
}

export const EmissionsLine = Template.bind({});
EmissionsLine.args = {
  board: elBoard()
};

function elBoardSpaceCards(): Board.Board {
  let board = elBoard()
  board = {
    ...board,
    emissionsLine: EL.cardSelected(board.emissionsLine, card)
  }
  return board
}

export const EmissionsLineSpaceCards = Template.bind({});
EmissionsLineSpaceCards.args = {
  board: elBoardSpaceCards()
};

function combinedBoard(): Board.Board {
  const currentTime = Date.now()
  
  let board = Board.create([...deck, ...deck])
  board = Board.drawHandCard(board, currentTime)
  board = Board.drawHandCard(board, currentTime)
  board = Board.drawHandCard(board, currentTime)

  board = Board.playCardFromDeck(board, currentTime)
  board = Board.playCardFromDeck(board, currentTime)
  board = Board.playCardFromDeck(board, currentTime)

  return board
}

function onEvent(event: EventToAdd) {
  console.log(event)
}

export const HandAndEmissionsLine = Template.bind({});
HandAndEmissionsLine.args = {
  board: combinedBoard(),
  onEvent: onEvent
};

const discardPile = (): Board.Board => {
  const currentTime = Date.now()
  
  let board = Board.create([...deck])
  board = Board.drawHandCard(board, currentTime)
  board = Board.drawHandCard(board, currentTime)
  const card = board.hand.cards[0]
  board = Board.discardCard(board, card, currentTime)

  return board
}

export const DiscardPile = Template.bind({});
DiscardPile.args = {
  board: discardPile(),
  onEvent: onEvent
};
