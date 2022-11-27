import React from 'react'
import ReactDOM from 'react-dom'
import { Stream } from '../stream'
import { Page } from '../pages/page'

interface Props {
  page$: Stream<Page>
}

interface State {
  page: React.ReactElement
}

class UIComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      page: <div></div>
    }
  }

  componentDidMount() {
    this.props.page$.subscribe(page => this.setState({ page: page.component }))
  }

  render() {
    return this.state.page
  }
}

export class UI {
  constructor(
    uiElem: HTMLElement,
    page$: Stream<Page>
  ) {
    ReactDOM.render(
      <UIComponent 
        page$={page$}
        />,
      uiElem
    )
  }
}
