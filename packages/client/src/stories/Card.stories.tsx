import _React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Card, CardPosition, defaultCardPositioning, Reflection, ZLevel } from '../core2/card'
import * as Canvas from '../components/Canvas';
import { CARD_WIDTH, CARD_HEIGHT } from '../core2/constants';
import { Movements } from '../core2/move';
import './font.css';
import * as SampleCards from './sample_cards'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Canvas/Card',
  component: Canvas.Component
} as ComponentMeta<typeof Canvas.Component>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Canvas.Component> =
  (args) => <Canvas.Component
    {...args}/>;


const position = (card: Card) => ({
  ...defaultCardPositioning(card),
  x: CARD_WIDTH/2,
  y: CARD_HEIGHT/2
})

const designs = SampleCards.cardDesigns
const cards = designs.map(d => d.card)
const positions = designs.map(d => position(d.card))
const visible: Card[] = cards.slice(0, 1)

const args = {
  designs: designs,
  getPositions: () => positions,
  getFlipped: () => [],
  getVisible: () => visible,
  getSelected: () => [],
  getSpaceCards: () => [],
  getReflections: () => [],
  getMovements: () => ({}),
  getZLevels: () => []
}

export const Front = Template.bind({});
Front.args = { ...args };

export const Back = Template.bind({});
Back.args = { ...args, getFlipped: () => visible };

const rotated = (positions: CardPosition[]) => positions.map(p => ({ ...p, rotation: Math.PI/6 }))
export const Rotation = Template.bind({});
Rotation.args = { ...args, getPositions: () => rotated(positions) }

const scaled = (positions: CardPosition[]) => positions.map(p => ({ ...p, scale: 2.0 }))
export const Scale = Template.bind({});
Scale.args = { ...args, getPositions: () => scaled(positions) }

export const ScaleAndRotation = Template.bind({});
ScaleAndRotation.args = { ...args, getPositions: () => rotated(scaled(positions)) }

const zLevels: ZLevel[] = [
  { card: positions[0].card, zLevel: 10 },
  { card: positions[1].card, zLevel: 0 }
]
const zLevelPositions = [
  { ...positions[0] },
  { ...positions[1], x: 300, y: 300 }
]
export const ZLevels = Template.bind({})
ZLevels.args = {
  ...args,
  getVisible: () => cards.slice(0, 2),
  getPositions: () => zLevelPositions,
  getZLevels: () => zLevels
}

const selected = visible
export const Selected = Template.bind({})
Selected.args = { ...args, getSelected: () => selected }

const spaceCards = visible
export const SpaceCard = Template.bind({})
SpaceCard.args = { ...args, getSpaceCards: () => spaceCards }

export const SpaceCardHidden = Template.bind({})
SpaceCardHidden.args = { ...args, getSpaceCards: () => spaceCards, getVisible: () => [] }

export const MultipleSpaceCards = Template.bind({})
MultipleSpaceCards.args = {
  ...args,
  getSpaceCards: () => cards, 
  getVisible: () => cards.slice(0, 2),
  getPositions: () => [positions[0], { ...positions[1], x: 300, y: 300 }]
}

const reflection: Reflection = {
  card: cards[0],
  reflected: cards[1]
}
export const ReflectOtherCard = Template.bind({})
ReflectOtherCard.args = {
  ...args,
  getSpaceCards: () => [reflection.card],
  getReflections: () => [reflection]
}

const moves = (moves: Movements): Movements => ({
  ...moves,
  [cards[0]]: {
    x: { from: 0, to: 300, started: Date.now() },
    y: { from: 0, to: 300, started: Date.now() },
    rotation: { from: 0, to: Math.PI/6, started: Date.now() },
    scale: { from: 0, to: 2.0, started: Date.now() }
  }
})

export const Transition = Template.bind({})
Transition.args = {
  ...args,
  getMovements: moves
}
