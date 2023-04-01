import _React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { Canvas } from '../components/Canvas'
import * as SampleCards from './sample_cards'
import './font.css'
import { Piles } from '../core/pile'
import { dict } from '../core/util'

export default {
  title: 'Canvas',
  component: Canvas
} as ComponentMeta<typeof Canvas>;

const designs = SampleCards.cardDesigns
const designsDict = dict(designs, d => d.card)
const cards = designs.map(d => d.card)
const piles: Piles = {
  hand: [],
  emissionsLine: [],
  discardPile: [],
  deck: []
}

const Template: ComponentStory<typeof Canvas> = (args) =>
  <Canvas {...args} />;

const args = { designs }

export const Hand = Template.bind({});
Hand.args = { ...args, getPiles: () => ({ ...piles, hand: cards }) }

export const EmissionsLine = Template.bind({});
EmissionsLine.args = { ...args, getPiles: () => ({
  ...piles,
  emissionsLine: cards.slice(1).sort((a,b) => (designsDict[a]?.emissions || 0) - (designsDict[b]?.emissions || 0)),
  hand: cards.slice(0, 1)
}) }

export const HandAndEmissionsLine = Template.bind({});
HandAndEmissionsLine.args = {
  ...args,
  getPiles: () => ({ ...piles, hand: cards.slice(2), emissionsLine: cards.slice(0, 2) })
}

export const DiscardPileAndDeck = Template.bind({});
DiscardPileAndDeck.args = {
  ...args,
  getPiles: () => ({ ...piles, discardPile: cards.slice(0, 2), deck: cards.slice(2, 4) })
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
