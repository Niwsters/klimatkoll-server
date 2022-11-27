import { Button } from '@shared/components'
import { singlePlayerStartedEvent } from '@shared/events'
import { AddEventFunc } from '@shared/models'
import React from 'react'
import { ButtonLayout } from '../ButtonLayout'
import { SetRoute } from '../set-route'

type Props = {
  services: {
    setRoute: SetRoute
    appWidth: number
    addEvent: AddEventFunc
    t: (key: string) => string
  }
}

export function SinglePlayerMenu(props: Props): React.ReactElement {
  const { setRoute, appWidth, addEvent, t } = props.services

  return (
    <ButtonLayout appWidth={appWidth}>
      <Button
        color="yellow"
        label={t('play')}
        onClick={() => addEvent(singlePlayerStartedEvent())}
      />
      <Button color="pink" label={t('go-back')} onClick={() => setRoute("/")}/>
    </ButtonLayout>
  )
}
