import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react';
import * as SampleCards from './sample_cards'

import * as Canvas from '../components/Canvas';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Canvas/Card',
  component: Canvas.Component
} as ComponentMeta<typeof Canvas.Component>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Canvas.Component> =
  (args) => <Canvas.Component {...args} />;

const card: Canvas.Card = {
  ...SampleCards.card,
  x: Canvas.CARD_WIDTH / 2,
  y: Canvas.CARD_HEIGHT / 2,
  rotation: 0,
  scale: 1.0,
  zLevel: 1.0
}

const card2: Canvas.Card = {
  ...SampleCards.card2,
  x: Canvas.CARD_WIDTH / 2,
  y: Canvas.CARD_HEIGHT / 2,
  rotation: 0,
  scale: 1.0,
  zLevel: 1.0
}

export const Front = Template.bind({});
Front.args = {
  getCards: () => [card]
};

export const Back = Template.bind({});
Back.args = {
  getCards: () => [{ ...card, flipped: true }]
};

export const Rotation = Template.bind({});
Rotation.args = {
  getCards: () => [{ ...card, flipped: true, rotation: Math.PI/6 }]
};

export const Scale = Template.bind({});
Scale.args = {
  getCards: () => [{ ...card, flipped: true, scale: 2.0 }]
};

export const ScaleAndRotation = Template.bind({});
ScaleAndRotation.args = {
  getCards: () => [{ ...card, flipped: true, scale: 2.0, rotation: Math.PI/6 }]
};

export const ZLevel = Template.bind({})
ZLevel.args = {
  getCards: () => [{ ...card, zLevel: 10}, {...card2, zLevel: 0, x: 300, y: 300}]
}
