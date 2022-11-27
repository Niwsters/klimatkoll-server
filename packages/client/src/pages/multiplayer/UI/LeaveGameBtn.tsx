import React from 'react'
import { EventToAdd, leaveGameEvent } from '../../../event/event'
import { PinkButton } from '@shared/components'

export function LeaveGameBtn(
  addEvent: (event: EventToAdd) => void,
  t: (key: string) => string
): React.ReactElement {
  function onClick() {
    addEvent(leaveGameEvent())
  }

  return PinkButton(t('btn-leave-game'), onClick)
}
