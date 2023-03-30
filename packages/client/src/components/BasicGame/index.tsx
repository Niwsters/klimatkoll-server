import * as Canvas from "../Canvas"
import { CardDesign } from "../../core2/card_design"
import { Card, defaultCardPositioning } from "../../core2/card"
import { getMovements, Movements } from "../../core2/move"
import { reformSpaceCards } from "../../core2/emissions_line"

export type Props = {
  designs: CardDesign[],
  hand: Card[],
  emissionsLine: Card[]
}

export const BasicGame = (props: Props): React.ReactElement => {
  let { designs, hand, emissionsLine } = props

  const cards = [...hand, ...emissionsLine]
  emissionsLine = reformSpaceCards(emissionsLine, [])
  const positions = designs.map(d => defaultCardPositioning(d.card))
  
  const args: Canvas.CanvasProps = {
    designs: designs,
    getPositions: () => positions,
    getFlipped: () => emissionsLine,
    getVisible: () => cards,
    getSelected: () => [],
    getSpaceCards: () => [],
    getReflections: () => [],
    getZLevels: () => [],
    getHand: () => hand,
    getEmissionsLine: () => emissionsLine
  }

  return <Canvas.Component {...args} />
}

/*
export type Props = {
  board: () => Board.Board,
  onCardPlayRequested: (event: Board.CardPlayRequestedEvent) => void,
  onBoardUpdate: (board: Board.Board) => void,
  cardDesigns: CardDesign[]
}

export function BasicGame(props: Props): React.ReactElement {
  const { board, cardDesigns, onCardPlayRequested, onBoardUpdate } = props

  let mouseX = 0
  let mouseX = 0
  let mouseY = 0

  function onMouseMovement(x: number, y: number) {
    mouseX = x
    mouseY = y
  }
  const matches = { "card_play_requested": onCardPlayRequested }
  const getMatch = (match: string) => Object.hasOwn(matches, match) ? matches[match] : () => {}
  const onGameEvent = (event: EventToAdd) => getMatch(event.event_type)(event)

  function onMouseClicked(x: number, y: number) {
    const [newBoard, events] = Board.mouseClicked(board(), x, y)
    onBoardUpdate(newBoard)
    events.forEach(onGameEvent)
  }

  const getCards = () => {
    const newBoard = Board.update(board(), mouseX, mouseY, Date.now())
    onBoardUpdate(newBoard)
    return Board.cards(newBoard)
  }

  return (
  return (
    <Canvas.Component
      getCards={getCards}
      onMouseMovement={onMouseMovement}
      onMouseClicked={onMouseClicked}
      cardDesigns={cardDesigns} />
  )
*/
