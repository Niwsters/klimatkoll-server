import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import * as Canvas from '../components/Canvas'
import * as Animation from '../core2/animation'

import { card as sampleCard } from './sample_cards'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Canvas/Animation',
  component: Canvas.Component
} as ComponentMeta<typeof Canvas.Component>;

const card = Animation.from_card(
  sampleCard,
  { x: Canvas.CARD_WIDTH / 2, y: Canvas.CARD_HEIGHT / 2}
)

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
  getCard: () => {
    const currentTime = Date.now()
    let newCard = card
    newCard = Animation.move_x(newCard, 100, currentTime)
    newCard = Animation.scale(newCard, 2.0, currentTime)
    return newCard
  }
};
