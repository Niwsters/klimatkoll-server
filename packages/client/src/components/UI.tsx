import { HEIGHT } from "../core/constants"
import { Button } from "./Button"
import _React, { ReactNode } from "react"
import { TFunction } from "tfunction"

const Container = (props: { children: ReactNode }) => {
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

export type Props = {
  t: TFunction,
  onLeaveGame: () => void
}

export const SPUI = (props: Props) => {
  const { t, onLeaveGame } = props

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

  return <Container>
    <Instructions></Instructions>
    <Button color="pink" onClick={onLeaveGame}>{t('leave-game')}</Button>
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
