import React, { ReactElement } from "react"

function ButtonWrapper(button: ReactElement, appWidth: number) {
  const style: any = {
    'marginTop': 0.0104*appWidth,
  }

  return <div style={style}>{button}</div>
}

export function ButtonLayout(props: { children: ReactElement[], appWidth: number }) {
  const { appWidth } = props

  const style: any = {
    'width': 0.271 * appWidth,
    'margin': '0 auto',
    'fontFamily': "'Poppins', sans-serif",
  }

  const children = props.children.map((elem, i) => {
    return {
      ...ButtonWrapper(elem, appWidth),
      key: i
    }
  })

  return <div style={style}>
    { children }
  </div>
}
