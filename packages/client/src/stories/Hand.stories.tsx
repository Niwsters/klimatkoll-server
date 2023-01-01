import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import * as Canvas from '../components/Canvas'
import * as Animation from '../core2/animation'
import * as Board from '../core2/board'
import * as SampleCards from './sample_cards'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Board/Hand',
  component: Canvas.Component
} as ComponentMeta<typeof Canvas.Component>;

const card = Animation.from_card(SampleCards.card)
const card2 = Animation.from_card(SampleCards.card2)
const card3 = Animation.from_card(SampleCards.card3)

type WrapperProps = {
}

function Wrapper(_props: WrapperProps): React.ReactElement {
  let board = Board.create()
  board = Board.add_hand_card(board, card)
  board = Board.add_hand_card(board, card2)
  board = Board.add_hand_card(board, card3)

  function getCards() {
    const currentTime = Date.now()
    board = Board.update(board, currentTime)
    return Board.cards(board, currentTime)
  }

  return (
    <Canvas.Component getCards={getCards} />
  )
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Wrapper> = (args) => <Wrapper {...args} />;

export const Hand = Template.bind({});
Hand.args = {
};
