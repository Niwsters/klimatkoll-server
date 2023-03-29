import _React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react';
import * as SampleCards from './sample_cards'
import { Card, CardPosition, Reflection } from '../core2/card'
import * as Canvas from '../components/Canvas';
import { Move } from 'core2/move';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Canvas/Card',
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

const designs = SampleCards.cardDesigns
const cards = designs.map(d => d.card)
const positions = designs.map(d => position(d.card))
const visible: Card[] = cards.slice(0, 1)

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Canvas.Component> =
  (args) => <Canvas.Component
    {...args}/>;

const args = {
  designs: designs,
  getPositions: () => positions,
  getFlipped: () => [],
  getVisible: () => visible,
  getSelected: () => [],
  getSpaceCards: () => [],
  getReflections: () => [],
  getMoves: () => []
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

const zLeveled = [
  { ...positions[0], zLevel: 10 },
  { ...positions[1], zLevel: 0, x: 300, y: 300 }
]
export const ZLevel = Template.bind({})
ZLevel.args = { ...args, getVisible: () => cards.slice(0, 2), getPositions: () => zLeveled }

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

const moves: () => Move[] = () => [
  { card: cards[0], field: "x", to: 300, timestamp: Date.now() },
  { card: cards[0], field: "y", to: 300, timestamp: Date.now() },
  { card: cards[0], field: "rotation", to: Math.PI/6, timestamp: Date.now() },
  { card: cards[0], field: "scale", to: 2.0, timestamp: Date.now() },
]

export const Transition = Template.bind({})
Transition.args = {
  ...args,
  getMoves: moves
}
