import { createSocket } from '../socket/socket'
import { EventToAdd, Event } from '../event/event'
import { EventStream } from '../event/event-stream'
import { Canvas } from '../canvas/canvas'
import { createRoot, Resolution, Root } from '../root'
import { MultiPlayerServer } from 'socket/multiplayer-server'
import i18next from 'i18next'
import { Menu } from '../pages/menu/UI/Menu'
import { Environment } from '../root/environment'
import { useEffect, useState } from 'react'

async function localisation(httpServerURL: string): Promise<any> {
  try {
    return (await fetch(`${httpServerURL}/localisation`)).json()
  } catch (e) {
    console.log("Failed to fetch localisation data:", e)
    return {}
  }
}

  /*
export class App {
  private readonly socket: Socket
  private readonly events$: EventStream
  private readonly canvas: Canvas
  private readonly router: Router

  private addEvent(e: EventToAdd) {
    this.events$.next(e)
  }

  private handleEvent(e: Event) {
    this.router.handleEvent(e)
  }

  constructor(root: Root, socket: Socket, localisationResource: any) {
    this.socket = socket
    this.events$ = new EventStream()
    const events$ = this.events$

    this.canvas = new Canvas(root.frame.canvasElem)
    this.canvas.prepare(`${root.environment.httpServerURL}/${root.environment.language}`)
    this.canvas.events$.subscribe((event: EventToAdd) => events$.next(event))

    const addEvent = this.addEvent.bind(this)

    this.socket.events$.subscribe((event: EventToAdd) => events$.next(event))
    events$.subscribe(e => this.socket.handleEvent(e))

    const mpServer = new MultiPlayerServer(socket)

    i18next.init({
      lng: root.environment.language,
      resources: localisationResource
    })

    const services: Services = {
      addEvent,
      environment: root.environment,
      resolution$: root.resolution$,
      events$,
      canvas: this.canvas,
      socketID: this.socket.socketID,
      mpServer: mpServer.inbox,
      t: i18next.t
    }
    this.router = new Router(new PageFactory(services))

    events$.subscribe(e => this.handleEvent(e))

    new UI(
      root.frame.uiElem,
      this.router.page$
    )

    root.resolution$.subscribe(resolution => this.canvas.resize(resolution.width, resolution.height))

    setInterval(() => {
      this.canvas.render(this.router.page.cards)
    }, 1000/60)
  }
}
*/

export type Props = {
  rootElem: HTMLElement
}

export type State = {
  mpServer: MultiPlayerServer,
  localisation: any
}

async function initMPServer(env: Environment): Promise<MultiPlayerServer> {
  const socket = await createSocket(env.wsServerURL, env.language)
  return new MultiPlayerServer(socket)
}

async function init(env: Environment): Promise<State> {
  const loc = await localisation(env.httpServerURL)

  i18next.init({
    lng: env.language,
    resources: loc
  })

  const mpServer = await initMPServer(env)

  return {
    mpServer,
    localisation: loc
  }
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

export function App({ rootElem }: Props) {
  const root = createRoot(rootElem)
  const env = root.environment

  initBaseFont(rootElem, root)

  let [state, setState] = useState<State>()
  useEffect(() => {
    init(env).then(setState)
  }, [])

  if (!state) return <Loading />

  return (
    <div>
      <div id="klimatkoll-inner">
        <Menu
          httpServerURL={env.httpServerURL}
          resolution$={root.resolution$}
          mpServer={state.mpServer.inbox}
          addEvent={(event: EventToAdd) => {console.log("Event:", event)}}
          t={i18next.t}
          />
      </div>
    </div>
  )
}
