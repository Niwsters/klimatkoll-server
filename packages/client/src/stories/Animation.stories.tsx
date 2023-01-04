import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import * as Canvas from '../components/Canvas'
import * as Card from '../core2/card'

import * as SampleCards from './sample_cards'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Canvas/Animation',
  component: Canvas.Component
} as ComponentMeta<typeof Canvas.Component>;

const card: Card.Card = Card.create(SampleCards.card, {
  zLevel: 0,
  x: Canvas.CARD_WIDTH / 2,
  y: Canvas.CARD_HEIGHT / 2,
  rotation: 0,
  scale: 1
})

type Board = {
  cards: Card.Card[]
}

type WrapperProps = {
  getCard: () => Card.Card
}

function Wrapper(props: WrapperProps): React.ReactElement {
  const board: Board = {
    cards: [props.getCard()]
  }

  return (
    <Canvas.Component getCards={() => board.cards.map(card => Card.update(card, Date.now()))} />
  )
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Wrapper> =
  (args) => <Wrapper {...args} />;

export const MoveX = Template.bind({});
MoveX.args = {
  getCard: () => Card.move_x(card, card.x + 100, Date.now())
};

export const MoveY = Template.bind({});
MoveY.args = {
  getCard: () => Card.move_y(card, card.y + 100, Date.now())
};

export const Rotation = Template.bind({});
Rotation.args = {
  getCard: () => Card.rotate(card, Math.PI / 6, Date.now())
};

/*
export const AddedRotation = Template.bind({});
AddedRotation.args = {
  getCard: () => {
    let animated = Animation.rotate(card, Math.PI / 6, Date.now())
    animated = Animation.rotateLocal(animated, Math.PI / 2, Date.now())
    return animated
  }
};
*/

export const Scale = Template.bind({});
Scale.args = {
  getCard: () => Card.scale(card, 2.0, Date.now())
};
