import { Socket, createSocket } from '../socket/socket'
import { EventToAdd, Event } from '../event/event'
import { EventStream } from '../event/event-stream'
import { Canvas } from '../canvas/canvas'
import { UI } from './UI'
import { createRoot, Root } from '../root'
import { Router } from '../router'
import { PageFactory, Services } from '../pages'
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
  console.log("Got socket")
  return new MultiPlayerServer(socket)
}

async function init(env: Environment): Promise<State> {
  console.log("Initialising...")
  const loc = await localisation(env.httpServerURL)
  console.log("Got loc")

  i18next.init({
    lng: env.language,
    resources: loc
  })
  console.log("Initialised i18next")

  const mpServer = await initMPServer(env)
  console.log("Got MP server")

  return {
    mpServer,
    localisation: loc
  }
}

function Loading() {
  return <div>Loading...</div>
}

export function App({ rootElem }: Props) {
  const root = createRoot(rootElem)
  const env = root.environment

  let [state, setState] = useState<State>()
  useEffect(() => {
    init(env).then(setState)
  }, [])

  if (!state) return <Loading />

  return <Menu
    httpServerURL={env.httpServerURL}
    resolution$={root.resolution$}
    mpServer={state.mpServer.inbox}
    addEvent={(event: EventToAdd) => {console.log("Event:", event)}}
    t={i18next.t}
    />
}

  /*
export async function createApp(root: Root) {
  const socket = await createSocket(root.environment.wsServerURL, root.environment.language)
  return new App(root, socket, await localisation(root.environment.httpServerURL))
}
   */
