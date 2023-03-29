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
const positions = designs.map(d => position(d.card))

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Canvas.Component> =
  (args) => <Canvas.Component
    {...args}
    designs={designs}
    getPositions={() => positions}/>;

/*
const card2 = Card.create(SampleCards.card2.name, positioning)
const spaceCard = Card.spaceCard(positioning, true)
*/

const visible: Card[] = designs.map(d => d.card).slice(0, 1)

export const Front = Template.bind({});
Front.args = { getVisible: () => visible };

/*
export const Back = Template.bind({});
Back.args = {};

export const Rotation = Template.bind({});
Rotation.args = {
  getCards: () => [{ ...card, flipped: true, rotation: Math.PI/6 }]
};

export const Scale = Template.bind({});
Scale.args = {
  getCards: () => [{ ...card, flipped: true, scale: 2.0, x: 100, y: 100 }]
};

export const ScaleAndRotation = Template.bind({});
ScaleAndRotation.args = {
  getCards: () => [{ ...card, flipped: true, scale: 2.0, rotation: Math.PI/6 }]
};

export const ZLevel = Template.bind({})
ZLevel.args = {
  getCards: () => [{ ...card, zLevel: 10}, {...card2, zLevel: 0, x: 300, y: 300 }]
}

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
