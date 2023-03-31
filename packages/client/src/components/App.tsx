import { CardDesign } from 'core/card_design'
import _, { useState } from 'react'
import { Menu } from './Menu'
import { SinglePlayer } from './SinglePlayer'

export type Props = {
  designs: CardDesign[]
}

export const App = (props: Props) => {
  const { designs } = props

  const [path, setPath] = useState("")

  const getPage = (path: string): React.ReactNode => {
    switch (path) {
      case "singleplayer":
        return <SinglePlayer designs={designs} />
      default:
        return <Menu t={() => ""} navigate={setPath} />
    }
  }

  const page = getPage(path)

  return <div>{page}</div>
}
