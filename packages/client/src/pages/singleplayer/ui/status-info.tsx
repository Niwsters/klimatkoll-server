import { SPState } from "../sp-state"
import { Style } from "./style"
import React from 'react'

type Props = {
  spState: SPState
  t: (key: string, props?: any) => string
}

function cardsLeft(spState: SPState): number {
  return spState.deck.length + spState.hand.length
}

function correctCards(spState: SPState): number {
  return spState.emissionsLine.length - 1
}

function isGameOver(spState: SPState): boolean {
  return cardsLeft(spState) === 0
}

function Info(props: Props): React.ReactElement {
  return (
    <div>
      <div>
        {props.t('cards-left')}: { cardsLeft(props.spState) }
      </div>
      <br />
      <div>
        {props.t('correct-placements')}: { correctCards(props.spState) }
      </div>
    </div>
  )
}

function GameOver(props: Props): React.ReactElement {
  return (
    <div>
      {props.t('sp-game-over', { cards: correctCards(props.spState) })}
    </div>
  )
}

function StatusMessage(props: Props): React.ReactElement {
  switch (isGameOver(props.spState)) {
    case true:
      return <GameOver spState={props.spState} t={props.t} />
    case false:
      return <Info spState={props.spState} t={props.t} />
  }
}

export function StatusInfo(props: Props): React.ReactElement {
  const style: Style = {
    "flex-grow": "1",
    "padding": "1em"
  }

  return (
    <div style={style}>
      <StatusMessage spState={props.spState} t={props.t} />
    </div>
  )
}
