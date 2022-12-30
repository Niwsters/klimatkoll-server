import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react';

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
  title: "Pendla",
  subtitle: "i medelstor biodieselbil",
  emissions: 4000,
  descr_front: "Köra 40 km varje arbetsdag i ett år",
  descr_back: "Biodieselproduktionen leder till avskogning vilket orsakar stora men svåruppskattade utsläpp",
  duration: "230 dagar",

  bg_color_front: "#1C1C45",
  bg_color_back: "#FAD44C",

  x: 0,
  y: 0,
  rotation: 0,
  scale: 1.0,

  flipped: false
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
