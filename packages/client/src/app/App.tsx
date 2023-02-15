import { createSocket } from '../socket/socket'
import { createRoot, Resolution, Root } from '../root'
import { MultiPlayerServer } from 'socket/multiplayer-server'
import i18next from 'i18next'
import { Environment } from '../root/environment'
import { useEffect, useState } from 'react'
import { Router } from './Router'

async function localisation(httpServerURL: string): Promise<any> {
  try {
    return (await fetch(`${httpServerURL}/localisation`)).json()
  } catch (e) {
    console.log("Failed to fetch localisation data:", e)
    return {}
  }
}

async function initMPServer(env: Environment): Promise<MultiPlayerServer> {
  const socket = await createSocket(env.wsServerURL, env.language)
  return new MultiPlayerServer(socket)
}

async function initLocalisation(env: Environment): Promise<any> {
  const loc = await localisation(env.httpServerURL)

  i18next.init({
    lng: env.language,
    resources: loc
  })

  return loc
}

function Loading() {
  return <div>Loading...</div>
}

function initBaseFont(rootElem: HTMLElement, root: Root) {
  const css = (appWidth: number) => `#klimatkoll-inner { font-size: ${0.021 * appWidth}px }`

  const elem = document.createElement('style')
  elem.innerText = css(2.1)
  rootElem.append(elem)

  const resize = (resolution: Resolution) => elem.innerText = css(resolution.width)

  root.resolution$.subscribe(resolution => resize(resolution))
}

export type Props = {
  rootElem: HTMLElement
}

export function App({ rootElem }: Props) {
  const root = createRoot(rootElem)
  const env = root.environment

  initBaseFont(rootElem, root)

  let [mpServer, setMPServer] = useState<MultiPlayerServer>()
  let [localisation, setLocalisation] = useState<any>()

  useEffect(() => {
    initMPServer(env).then(setMPServer)
    initLocalisation(env).then(setLocalisation)
  }, [])

  if (!mpServer || !localisation) return <Loading />

  return (
    <div id="klimatkoll-inner">
      <Router
        mpServer={mpServer}
        root={root}/>
    </div>
  )
}
