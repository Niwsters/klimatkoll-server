import { EventToAdd } from '@shared/events'
import { AddEventFunc } from '@shared/models'
import { Inbox } from 'inbox'

export type MenuServices = {
  httpServerURL: string
  appWidth: number
  mpServer: Inbox<EventToAdd>
  addEvent: AddEventFunc
  t: (key: string) => string
}
