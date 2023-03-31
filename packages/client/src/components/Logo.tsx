import React from 'react'
import { TFunction } from '../tfunction'

type Props = {
  appWidth: number
  t: TFunction
}

export function Logo(props: Props): React.ReactElement {
  const { appWidth, t } = props

  const style: any = {
    "display": "block",
    "width": 0.3125 * appWidth,
    'margin': 'auto',
    'paddingBottom': 0.03125 * appWidth,
  }

  return <img src={"/logo.webp"} alt={t('alt-logo')} style={style} />
}
