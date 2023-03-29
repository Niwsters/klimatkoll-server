
import _React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import * as Canvas from '../components/Canvas';
import * as SampleCards from './sample_cards'
import { Card, CardPosition } from '../core2/card';
import { handMoves } from '../core2/hand'
import { Move } from 'core2/move';

export default {
  title: 'Canvas/Board',
  component: Canvas.Component
} as ComponentMeta<typeof Canvas.Component>;

const position = (card: Card): CardPosition => ({
  card,
  x: Canvas.CARD_WIDTH / 2,
  y: Canvas.CARD_HEIGHT / 2,
  rotation: 0,
  scale: 1.0,
  zLevel: 1.0
})

export type Pile = "hand"

export type PileCard = {
  card: Card,
  pile: Pile
}

const designs = SampleCards.cardDesigns
const cards = designs.map(d => d.card)
const positions = designs.map(d => position(d.card))
const visible: Card[] = cards.slice(0, 1)

let moves: Move[] = []
const hand = new Set(designs.map(d => d.card))

const Template: ComponentStory<typeof Canvas.Component> = (args) => {
  moves = []
  return <Canvas.Component {...args} />;
}

const args = {
  designs: designs,
  getPositions: () => positions,
  getFlipped: () => [],
  getVisible: () => visible,
  getSelected: () => [],
  getSpaceCards: () => [],
  getReflections: () => [],
  getMoves: () => {
    moves = handMoves(moves, hand, positions, Date.now())
    return moves
  }
}

export const Hand = Template.bind({});
Hand.args = { ...args }

/*
import * as Canvas from '../components/Canvas'
import * as Board from '../core2/board'
import * as SampleCards from './sample_cards'
import * as EL from '../core2/emissions_line'
import * as Card from '../core2/card'
import { BasicGame } from '../components/BasicGame'
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
const Template: ComponentStory<typeof BasicGame> = (args) =>
  <BasicGame {...args} cardDesigns={cardDesigns} />;

const currentTime = Date.now()

let handBoard = Board.create(deck)
handBoard = Board.drawHandCard(handBoard, currentTime)
handBoard = Board.drawHandCard(handBoard, currentTime)
handBoard = Board.drawHandCard(handBoard, currentTime)
export const Hand = Template.bind({});
Hand.args = {
  board: () => handBoard,
  onBoardUpdate: b => handBoard = b
};

let elBoard = Board.create(deck)
elBoard = Board.playCardFromDeck(elBoard, currentTime)
elBoard = Board.playCardFromDeck(elBoard, currentTime)
elBoard = Board.playCardFromDeck(elBoard, currentTime)
export const EmissionsLine = Template.bind({});
EmissionsLine.args = {
  board: () => elBoard,
  onBoardUpdate: b => elBoard = b
};

let elBoardSpaceCards = { ...elBoard }
elBoardSpaceCards = {
  ...elBoardSpaceCards,
  emissionsLine: EL.cardSelected(elBoardSpaceCards.emissionsLine, card)
}
export const EmissionsLineSpaceCards = Template.bind({});
EmissionsLineSpaceCards.args = {
  board: () => elBoardSpaceCards,
  onBoardUpdate: b => elBoardSpaceCards = b
};

let combinedBoard = Board.create([...deck, ...deck])
combinedBoard = Board.drawHandCard(combinedBoard, currentTime)
combinedBoard = Board.drawHandCard(combinedBoard, currentTime)
combinedBoard = Board.drawHandCard(combinedBoard, currentTime)
combinedBoard = Board.playCardFromDeck(combinedBoard, currentTime)
combinedBoard = Board.playCardFromDeck(combinedBoard, currentTime)
combinedBoard = Board.playCardFromDeck(combinedBoard, currentTime)

export const HandAndEmissionsLine = Template.bind({});
HandAndEmissionsLine.args = {
  board: () => combinedBoard,
  onBoardUpdate: b => combinedBoard = b
};

let discardPileBoard = Board.create([...deck])
discardPileBoard = Board.drawHandCard(discardPileBoard, currentTime)
discardPileBoard = Board.drawHandCard(discardPileBoard, currentTime)
const discardedCard = discardPileBoard.hand.cards[0]
discardPileBoard = Board.discardCard(discardPileBoard, discardedCard.name, currentTime)
export const DiscardPile = Template.bind({});
DiscardPile.args = {
  board: () => discardPileBoard,
  onBoardUpdate: b => discardPileBoard = b
};
*/
