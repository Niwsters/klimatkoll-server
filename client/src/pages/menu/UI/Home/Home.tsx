import React from 'react'
import { Button } from '@shared/components'
import { ButtonLayout } from '../ButtonLayout'
import { SetRoute } from '../set-route'

export function Home(props: { appWidth: number, setRoute: SetRoute }): React.ReactElement {
  const { appWidth, setRoute } = props

  return (
    <ButtonLayout appWidth={appWidth}>
      <Button color="yellow" onClick={() => setRoute("/singleplayer")}>
        Singleplayer
      </Button>
      <Button color="pink" label="Multiplayer" onClick={() => setRoute("/multiplayer")} />
    </ButtonLayout>
  )
}
