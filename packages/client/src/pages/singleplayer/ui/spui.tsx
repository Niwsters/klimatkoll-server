import React from "react";
import { Button } from '@shared/components'
import { SPState } from "../sp-state";
import { StatusInfo } from './status-info'

function Container(props: any): React.ReactElement {
  const style = {
    "display": "flex",
    "flex-direction": "column",
    "background": "#F3EFEC",
    "width": "11.4em",
    "height": "26.75em"
  }

  return (
    <div style={style}>
      { props.children }
    </div>
  )
}

function Instructions(props: { t: (key: string) => string }) {
  const style = {
    "padding": "1em"
  }

  return (
    <div style={style}>
      {props.t('sp-instructions')}
      
    </div>
  )
}

type Props = {
  leaveGame: () => void
  getState: () => SPState
  t: (key: string) => string
}

type State = {
  spState: SPState
}

export class SPUI extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      spState: props.getState()
    }

    setInterval(() => this.setState({ spState: props.getState() }), 100)
  }

  render() {
    const { t } = this.props

    return (
      <Container>
        <Instructions t={t} />
        <StatusInfo
          spState={this.state.spState}
          t={t}
        />
        <Button color="pink" onClick={this.props.leaveGame}>{t('leave-game')}</Button>
      </Container>
    )
  }
}
