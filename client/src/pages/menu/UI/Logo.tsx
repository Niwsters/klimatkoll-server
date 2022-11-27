import React from 'react'

type Props = {
  httpServerURL: string
  appWidth: number
  t: (key: string) => string
}

export function Logo(props: Props): React.ReactElement {
  const { appWidth, httpServerURL, t } = props

  const style: any = {
    "display": "block",
    "width": 0.3125 * appWidth,
    'margin': 'auto',
    'paddingBottom': 0.03125 * appWidth,
  }

  return <img src={httpServerURL + "/logo.webp"} alt={t('alt-logo')} style={style} />
}
