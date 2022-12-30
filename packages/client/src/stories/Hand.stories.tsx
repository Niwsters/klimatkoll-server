import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import * as Canvas from '../components/Canvas'
import * as Animation from '../core2/animation'
import * as Board from '../core2/board'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Canvas/Board',
  component: Canvas.Component
} as ComponentMeta<typeof Canvas.Component>;

const canvasCard: Canvas.Card = {
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

const card = Animation.from_card(canvasCard)

type WrapperProps = {
}

function Wrapper(_props: WrapperProps): React.ReactElement {
  let board = Board.create()
  board = Board.add_hand_card(board, card)

  return (
    <Canvas.Component getCards={() => Board.cards(board)} />
  )
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Wrapper> = (args) => <Wrapper {...args} />;

export const Hand = Template.bind({});
Hand.args = {
};
