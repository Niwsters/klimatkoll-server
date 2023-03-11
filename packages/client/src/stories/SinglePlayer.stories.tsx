import _React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import * as Canvas from '../components/Canvas'
import { SinglePlayer } from '../components/SinglePlayer'
import { ServerCard } from '../components/App/fetch-cards'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'SinglePlayer/SinglePlayer',
  component: Canvas.Component
} as ComponentMeta<typeof SinglePlayer>;

const id = () => Math.random().toString()

const card = (name: string, descr: string, emissions: number): ServerCard => ({
  id: id(),
  name,
  emissions,

  language: "sv",
  languageLabel: "Svenska",

  bg_color_front: "#1C1C45",
  bg_color_back: "#FAD44C",

  descr_front: descr,
  descr_back: descr,
  duration: "365",
  subtitle: "",
  title: name
})

const deck = [
  card("Blargh", "Blargh is love", 100),
  card("Honk", "Honk is life", 200),
  card("Oh hi", ":D", 300)
]

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof SinglePlayer> = (args) => <SinglePlayer {...args} />;

export const Something = Template.bind({});
Something.args = {
  cards: deck
};
