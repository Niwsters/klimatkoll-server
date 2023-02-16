import * as Board from "../../core2/board"
import * as Canvas from "../Canvas"
import { EventToAdd } from "@shared/events"
import { CardDesign } from "core2/card_design"

export type Props = {
  board: Board.Board,
  onEvent: (event: EventToAdd) => void,
  getCardDesign: (name: string) => CardDesign
}

export function BasicGame(props: Props): React.ReactElement {
  let { board } = props
  const { getCardDesign } = props

  let mouseX = 0
  let mouseY = 0

  function onMouseMove(x: number, y: number) {
    mouseX = x
    mouseY = y
  }

  function onMouseClicked(x: number, y: number) {
    let events: EventToAdd[]
    [board, events] = Board.mouseClicked(board, x, y)
    events.forEach(props.onEvent)
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
      getCardDesign={getCardDesign} />
  )
}
