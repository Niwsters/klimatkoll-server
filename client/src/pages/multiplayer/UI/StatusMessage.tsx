import React from 'react'

export function StatusMessage(
  message: string,
  appWidth: number
): React.ReactElement {
  const style: any = {
    "font-size": "1.5873em",
    'padding-right': 0.024 * appWidth
  }

  return <div style={style}>{ message }</div>
}
