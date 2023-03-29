import _React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react';
import * as SampleCards from './sample_cards'
import { Card, CardPosition } from '../core2/card'
import * as Canvas from '../components/Canvas';

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

const args = { designs: designs, getPositions: () => positions, getFlipped: () => [], getVisible: () => visible }

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
/*
  getCards: () => [{ ...card, zLevel: 10}, {...card2, zLevel: 0, x: 300, y: 300 }]
}
*/

/*
export const Selected = Template.bind({})
Selected.args = {
  getCards: () => [{ ...card, selected: true }]
}

export const SpaceCard = Template.bind({})
SpaceCard.args = {
  getCards: () => [{ ...spaceCard }]
}

export const SpaceCardHidden = Template.bind({})
SpaceCardHidden.args = {
  getCards: () => [{ ...spaceCard, visible: false }]
}

const spaceCard2 = Card.spaceCard({...positioning, x: Canvas.CARD_WIDTH, y: Canvas.CARD_HEIGHT / 2}, true)
export const SpaceCardReflectOtherCard = Template.bind({})
SpaceCardReflectOtherCard.args = {
  getCards: () => [{ ...spaceCard, name: SampleCards.card.name }, { ...spaceCard2, name: SampleCards.card.name, flipped: true }]
}
*/
