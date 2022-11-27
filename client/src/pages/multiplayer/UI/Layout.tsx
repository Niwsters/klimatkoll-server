import React from 'react'

function StatusElement(props: { children: React.ReactElement, appWidth: number }) {
  const style: any = {
    'padding-left': 0.0417 * props.appWidth
  }

  return <div style={style}>{props.children}</div>
}

export function Layout(props: { children: React.ReactElement[], bottomButton: React.ReactElement, appWidth: number }) {
  let { children, bottomButton, appWidth} = props
  children = children.map(elem => <StatusElement appWidth={appWidth}>{elem}</StatusElement>)

  const style: any = {
    "display": "flex",
    "justify-content": "space-between",
    "flex-direction": "column",
    "height": "100%"
  }

  return <div style={style}>
    {children}
    {bottomButton}
  </div>
}
