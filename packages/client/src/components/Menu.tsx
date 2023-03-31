import _, { CSSProperties, useState } from 'react'
import { Logo } from './Logo'
import { HEIGHT, WIDTH } from '../core/constants'
import { Button } from './Button'
import { ButtonLayout } from './ButtonLayout'

type Navigate = (path: string) => void

const Home = (props: { appWidth: number, navigate: Navigate }): React.ReactElement => {
  const { appWidth, navigate } = props

  return (
    <ButtonLayout appWidth={appWidth}>
      <Button color="yellow" onClick={() => navigate("singleplayer")}>
        Singleplayer
      </Button>
      <Button
        color="pink"
        label="Multiplayer"
        disabled={true}
        onClick={() => navigate("multiplayer")} />
    </ButtonLayout>
  )
}

export type Props = {
  t: (key: string) => string
  navigate: Navigate
}

export const Menu = (props: Props) => {
  const { t, navigate } = props
  const width = WIDTH
  const height = HEIGHT

  const style: CSSProperties = {
    background: '#181543',
    width: width + 'px',
    height: height + 'px',
    paddingTop: 0.104 * width + 'px',
    boxSizing: 'border-box',
  }

  const [path, setPath] = useState("")

  const getPage = (path: string): React.ReactNode => {
    console.log(path)
    switch (path) {
      default:
        return <Home appWidth={width} navigate={setPath} />
    }
  }

  const page = getPage(path)

  return (
    <div style={style}>
      <Logo appWidth={width} t={t} />
      <ButtonLayout appWidth={width}>
        <Button color="yellow" onClick={() => navigate("singleplayer")}>
          Singleplayer
        </Button>
        <Button
          color="pink"
          label="Multiplayer"
          disabled={true}
          onClick={() => navigate("multiplayer")} />
      </ButtonLayout>
    </div>
  )
}
