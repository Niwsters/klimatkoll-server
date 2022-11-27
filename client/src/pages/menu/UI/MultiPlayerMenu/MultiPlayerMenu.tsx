import React from 'react'
import { TextInput } from './TextInput'
import { ButtonLayout } from '../ButtonLayout'
import { SetRoute } from '../set-route'
import { Button } from '@shared/components'
import { createGameEvent, EventToAdd, joinGameEvent } from '@shared/events'
import { Inbox } from 'inbox'

interface Props {
  services: {
    httpServerURL: string
    appWidth: number
    setRoute: SetRoute
    mpServer: Inbox<EventToAdd>,
    t: (key: string) => string
  }
}

interface State {
  roomID: string
}

export class MultiPlayerMenu extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { roomID: "" }
  }

  private setRoomID(roomID: string) {
    this.setState({ roomID })
  }

  private createGame() {
    this.props.services.mpServer.send(createGameEvent(this.state.roomID))
  }

  private joinGame() {
    this.props.services.mpServer.send(joinGameEvent(this.state.roomID))
  }

  render() {
    const { appWidth, setRoute, t } = this.props.services
    const setRoomID = this.setRoomID.bind(this)

    return (
      <div>
        <ButtonLayout appWidth={appWidth}>
          { TextInput(t('room-id'), setRoomID, appWidth) }
          <Button
            label={t('create-game')}
            onClick={() => this.createGame()}
            color="pink"
          />
          <Button
            label={t('join-game')}
            onClick={() => this.joinGame()}
            color="yellow"
          />
          <Button
            label={t('go-back')}
            onClick={() => setRoute("/")}
            color="pink"
          />
        </ButtonLayout>
      </div>
    )
  }
}
