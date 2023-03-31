import { Button } from "./Button"
import _React, { ReactNode } from "react"
import { TFunction } from "tfunction"

const Container = (props: { children: ReactNode }) => {
  const style = {
    position: "absolute",
    top: 0,
    display: "flex",
    background: "#F3EFEC",
    width: "inherit",
    height: "50px"
  } as const

  return (
    <div style={style}>
      { props.children }
    </div>
  )
}

export type Props = {
  t: TFunction,
  onLeaveGame: () => void,
  score: number
}

export const SPUI = (props: Props) => {
  const { t, onLeaveGame, score } = props

  const Instructions = () => {
    const style = {
      width: "100%",
      padding: "1em"
    }

    return (
      <div style={style}>
        {t('sp-instructions')}
      </div>
    )
  }

  const Score = () => {
    const style = {
      padding: "1em",
      width: "10em"
    }

    return <div style={style}>{t('score')}: { score }</div>
  }

  return <Container>
    <Instructions />
    <Score />
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
