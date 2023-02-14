import React, { CSSProperties } from 'react'
import { AddEventFunc } from '@shared/models'
import { Stream } from '../../../stream'
import { Resolution } from '../../../root'
import { Logo } from './Logo'
import { Router } from './Router'
import { MenuServices } from './menu-services'
import { EventToAdd } from '@shared/events'
import { Inbox } from 'inbox'

interface Props {
  httpServerURL: string
  resolution$: Stream<Resolution>
  mpServer: Inbox<EventToAdd>
  addEvent: AddEventFunc
  t: (key: string) => string
}

interface State {
  resolution: Resolution
}

export class Menu extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      resolution: { width: 0, height: 0 }
    }
  }

  componentDidMount() {
    this.props.resolution$.subscribe(resolution => this.setState({ resolution }))
  }

  render() {
    const { t, httpServerURL, mpServer, addEvent } = this.props
    const { resolution } = this.state
    const { width, height } = resolution

    const services: MenuServices = {
      appWidth: width,
      httpServerURL,
      mpServer,
      addEvent,
      t
    }

    const style: CSSProperties = {
      background: '#181543',
      width: width + 'px',
      height: height + 'px',
      paddingTop: 0.104 * width + 'px',
      boxSizing: 'border-box',
    }

    return (
      <div style={style}>
        <Logo
          httpServerURL={httpServerURL}
          appWidth={width}
          t={t}
        />
        <Router services={services} />
      </div>
    )
  }
}
