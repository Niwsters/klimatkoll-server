import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import * as Canvas from '../components/Canvas'
import * as Animation from '../core2/animation'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Canvas/Animation',
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

  x: Canvas.CARD_WIDTH / 2,
  y: Canvas.CARD_HEIGHT / 2,
  rotation: 0,
  scale: 1.0,

  flipped: false
}

const card = Animation.from_card(canvasCard)

type Board = {
  cards: Animation.AnimatedCard[]
}

type WrapperProps = {
  getCard: () => Animation.AnimatedCard
}

function Wrapper(props: WrapperProps): React.ReactElement {
  const board: Board = {
    cards: [props.getCard()]
  }

  return (
    <Canvas.Component getCards={() => board.cards.map(card => Animation.animate(card, Date.now()))} />
  )
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Wrapper> =
  (args) => <Wrapper {...args} />;

export const MoveX = Template.bind({});
MoveX.args = {
  getCard: () => Animation.move_x(card, Animation.get_x(card, Date.now()) + 100, Date.now())
};

export const MoveY = Template.bind({});
MoveY.args = {
  getCard: () => Animation.move_y(card, Animation.get_y(card, Date.now()) + 100, Date.now())
};

export const Rotation = Template.bind({});
Rotation.args = {
  getCard: () => Animation.rotate(card, Math.PI / 6, Date.now())
};

export const AddedRotation = Template.bind({});
AddedRotation.args = {
  getCard: () => {
    let animated = Animation.rotate(card, Math.PI / 6, Date.now())
    animated = Animation.rotateLocal(animated, Math.PI / 2, Date.now())
    return animated
  }
};

export const Scale = Template.bind({});
Scale.args = {
  getCard: () => Animation.scale(card, 2.0, Date.now())
};
