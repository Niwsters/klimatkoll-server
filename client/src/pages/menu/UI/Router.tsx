import React from 'react'
import { MenuServices } from './menu-services'
import { Home } from './Home'
import { SetRoute } from './set-route'
import { MultiPlayerMenu } from './MultiPlayerMenu'
import { SinglePlayerMenu } from './SinglePlayerMenu'

type Props = {
  services: MenuServices
}

type State = {
  route: string
}

function getRouteComponent(route: string, services: MenuServices, setRoute: SetRoute): React.ReactElement {
  switch (route) {
    case "/":
      return <Home appWidth={services.appWidth} setRoute={setRoute} />
    case "/multiplayer":
      return <MultiPlayerMenu services={{...services, setRoute}} />
    case "/singleplayer":
      return <SinglePlayerMenu services={{...services, setRoute}} />
    default:
      throw new Error(`Could not find component for route: ${route}`)
  }
}

export class Router extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      route: "/"
    }
  }

  private setRoute(route: string) {
    this.setState({ route })
  }

  render() {
    return getRouteComponent(this.state.route, this.props.services, this.setRoute.bind(this))
  }
}
