import { HEIGHT } from "../Canvas"
import React from "react"

function Container(props: any): React.ReactElement {
  const style = {
    position: "absolute",
    top: 0,
    display: "flex",
    flexDirection: "column",
    background: "#F3EFEC",
    width: "11.4em",
    height: HEIGHT + "px"
  } as const

  return (
    <div style={style}>
      { props.children }
    </div>
  )
}

const t = (name: string) => ""

const Instructions = () => {
  const style = {
    "padding": "1em"
  }

  return (
    <div style={style}>
      {t('sp-instructions')}
    </div>
  )
}

export const SPUI = () => {
  return <Container>
    <Instructions></Instructions>
  </Container>
}

  /*
export class SPUI extends React.Component<Props, State> {
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
   */
