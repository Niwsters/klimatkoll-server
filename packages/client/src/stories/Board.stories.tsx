import _React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import * as Canvas from '../components/Canvas';
import * as SampleCards from './sample_cards'
import { Card } from '../core2/card';
import { BasicGame } from '../components/BasicGame';
import './font.css'

export default {
  title: 'Canvas/Board',
  component: Canvas.Component
} as ComponentMeta<typeof Canvas.Component>;

export type Pile = "hand"

export type PileCard = {
  card: Card,
  pile: Pile
}

const designs = SampleCards.cardDesigns
const cards = designs.map(d => d.card)

const Template: ComponentStory<typeof BasicGame> = (args) =>
  <BasicGame {...args} />;

const args = { designs }

export const Hand = Template.bind({});
Hand.args = { ...args, hand: cards, emissionsLine: [] }

export const EmissionsLine = Template.bind({});
EmissionsLine.args = { ...args, hand: [], emissionsLine: cards }

export const HandAndEmissionsLine = Template.bind({});
HandAndEmissionsLine.args = {
  ...args,
  hand: cards.slice(2),
  emissionsLine: cards.slice(0, 2)
}

/*

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
