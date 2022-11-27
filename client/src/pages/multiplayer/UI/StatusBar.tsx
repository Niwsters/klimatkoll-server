import React from 'react'
import { GameState } from 'core/gamestate'
import { EventToAdd } from '../../../event/event'
import { RoomID } from './RoomID'
import { LeaveGameBtn } from './LeaveGameBtn'
import { StatusMessage } from './StatusMessage'
import { Layout } from './Layout'
import { Resolution } from '../../../root'
import { Stream } from '../../../stream'

type Props = {
  gamestate: GameState,
  addEvent: (e: EventToAdd) => void,
  resolution$: Stream<Resolution>,
  t: (key: string) => string
}

type State = {
  resolution: Resolution
}

export class StatusBar extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { resolution: { width: 0, height: 0 } }
  }

  componentDidMount() {
    this.props.resolution$.subscribe(resolution => this.setState({ resolution }))
  }

  render() {
    const { gamestate, addEvent, t } = this.props
    const { resolution } = this.state
    const { width } = resolution
    const statusMessage: string = gamestate.statusMessage
    const roomID = gamestate.roomID

    const style = {
      "box-sizing": "border-box",
      "width": 0.24 * width,
      "height": 0.5625 * width,
      "background": "#F3EFEC",
      "padding-top": 0.021 * width,
      "color": "#444"
    }

    return (
      <div id="status-bar" style={style}>
        <Layout bottomButton={LeaveGameBtn(addEvent, t)} appWidth={width}>
          { RoomID(roomID, t) }
          { StatusMessage(statusMessage, width) }
        </Layout>
      </div>
    )
  }
}
