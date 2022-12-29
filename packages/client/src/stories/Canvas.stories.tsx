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

export const Primary = Template.bind({});

const card: Canvas.Card = {
  title: "Bilresa",
  subtitle: "Stockholm - Göteborg",
  emissions: 80,
  descr_front: "En tur och retur-resa på sammanlagt 900 km med två personer i en medelstor dieselbil",
  descr_back: "En tur och retur-resa på sammanlagt 900 km med två personer i en medelstor dieselbil",
  duration: "1 dag",
  x: 100,
  y: 100,
  rotation: Math.PI / 4
}

const card2: Canvas.Card = {
  title: "Bilresa",
  subtitle: "Stockholm - Göteborg",
  emissions: 80,
  descr_front: "En tur och retur-resa på sammanlagt 900 km med två personer i en medelstor dieselbil",
  descr_back: "En tur och retur-resa på sammanlagt 900 km med två personer i en medelstor dieselbil",
  duration: "1 dag",
  x: 400,
  y: 100,
  rotation: -Math.PI/6
}

setInterval(() => {
  card.rotation += 0.01
}, 1000/60)

// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  cards: [card, card2]
};

/*
export const Secondary = Template.bind({});
Secondary.args = {
  label: 'Button',
};

export const Large = Template.bind({});
Large.args = {
  size: 'large',
  label: 'Button',
};

export const Small = Template.bind({});
Small.args = {
  size: 'small',
  label: 'Button',
};
 */
