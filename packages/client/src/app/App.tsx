import { createSocket } from '../socket/socket'
import { EventToAdd, Event } from '../event/event'
import { createRoot, Resolution, Root } from '../root'
import { MultiPlayerServer } from 'socket/multiplayer-server'
import i18next from 'i18next'
import { Menu } from '../pages/menu/UI/Menu'
import { Environment } from '../root/environment'
import { ReactElement, useEffect, useState } from 'react'
import * as Canvas from '../components/Canvas'
import * as SampleCards from '../stories/sample_cards'

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

async function init(env: Environment): Promise<State> {
  const localisation = initLocalisation(env)
  const mpServer = await initMPServer(env)

  return { mpServer, localisation }
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

export type State = {
  mpServer: MultiPlayerServer,
  localisation: any
}

export type Page = "menu" | "canvas"

export function Router(props: { state: State, root: Root }) {
  const { state, root } = props

  const route = (event: EventToAdd) => {
    switch (event.event_type) {
      case "singleplayer_started":
        return "canvas"
      default:
        return "menu"
    }
  }

  const [page, setPage] = useState<Page>("menu")
  const onEvent = (event: EventToAdd) => {
    setPage(route(event))
  }

  const menu = <Menu
    httpServerURL={root.environment.httpServerURL}
    resolution$={root.resolution$}
    mpServer={state.mpServer.inbox}
    addEvent={onEvent}
    t={i18next.t}
    />

  const getCards: Canvas.GetCards = () => []
  const getCardDesign: Canvas.GetCardDesign = (_name: string) => SampleCards.card
  const canvas = <Canvas.Component
    getCards={getCards}
    getCardDesign={getCardDesign}
    />

  const component = (route: Page) => {
    switch (route) {
      case "menu":
        return menu
      case "canvas":
        return canvas
    }
  }

  return (
    <div id="klimatkoll-inner">
      { component(page) }
    </div>
  )
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
    <div id="klimatkoll-inner">
      <Router
        state={state}
        root={root}/>
    </div>
  )
}
