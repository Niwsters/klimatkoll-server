import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import * as Canvas from '../components/Canvas'
import * as Board from '../core2/board'
import * as SampleCards from './sample_cards'
import * as EL from '../core2/emissions_line'
import * as Card from '../core2/card'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Canvas/Board',
  component: Canvas.Component
} as ComponentMeta<typeof Canvas.Component>;

const positioning: Card.CardPositioning = {
  x: 0,
  y: 0,
  rotation: 0,
  scale: 1,
  zLevel: 0
}

const card = Card.create(SampleCards.card.name, positioning)
const card2 = Card.create(SampleCards.card2.name, positioning)
const card3 = Card.create(SampleCards.card3.name, positioning)

type WrapperProps = {
  board: Board.Board
}

function Wrapper(props: WrapperProps): React.ReactElement {
  let board = props.board

  let mouseX = 0
  let mouseY = 0

  function onMouseMove(x: number, y: number) {
    mouseX = x
    mouseY = y
  }

  function onMouseClicked(x: number, y: number) {
    board = Board.mouse_clicked(board, x, y)
  }

  function getCards() {
    const currentTime = Date.now()
    board = Board.update(board, mouseX, mouseY, currentTime)
    return Board.cards(board)
  }

  return (
    <Canvas.Component
      getCards={getCards}
      onMouseMove={onMouseMove}
      onMouseClicked={onMouseClicked}
      getCardDesign={SampleCards.getCardDesign} />
  )
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Wrapper> = (args) => <Wrapper {...args} />;

function handBoard(): Board.Board {
  const currentTime = Date.now()

  let board = Board.create()
  board = Board.add_hand_card(board, card, currentTime)
  board = Board.add_hand_card(board, card2, currentTime)
  board = Board.add_hand_card(board, card3, currentTime)
  return board
}

export const Hand = Template.bind({});
Hand.args = {
  board: handBoard()
};

function elBoard(): Board.Board {
  const currentTime = Date.now()

  let board = Board.create()
  board = Board.add_el_card(board, card, currentTime)
  board = Board.add_el_card(board, card2, currentTime)
  board = Board.add_el_card(board, card3, currentTime)
  return board
}

export const EmissionsLine = Template.bind({});
EmissionsLine.args = {
  board: elBoard()
};

function elBoardSpaceCards(): Board.Board {
  let board = elBoard()
  board = {
    ...board,
    emissionsLine: EL.card_selected(board.emissionsLine, card)
  }
  return board
}

export const EmissionsLineSpaceCards = Template.bind({});
EmissionsLineSpaceCards.args = {
  board: elBoardSpaceCards()
};

function combinedBoard(): Board.Board {
  return {
    hand: handBoard().hand,
    emissionsLine: elBoard().emissionsLine
  }
}

export const HandAndEmissionsLine = Template.bind({});
HandAndEmissionsLine.args = {
  board: combinedBoard()
};
