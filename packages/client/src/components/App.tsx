import { CardDesign } from 'core/card_design'
import _, { useState } from 'react'
import { TFunction } from 'tfunction'
import { Menu } from './Menu'
import { SinglePlayer } from './SinglePlayer'

export type Props = {
  designs: CardDesign[]
  t: TFunction
}

export const App = (props: Props) => {
  const { designs, t } = props

  const [path, setPath] = useState("")

  const getPage = (path: string): React.ReactNode => {
    switch (path) {
      case "singleplayer":
        return <SinglePlayer t={t} designs={designs} navigate={setPath} />
      default:
        return <Menu t={() => ""} navigate={setPath} />
    }
  }

  const page = getPage(path)

  return <div>{page}</div>
}
