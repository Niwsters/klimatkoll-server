import { Event } from '@shared/events'

export type EventHandler<T> = (state: T, event: Event) => T
export type EventHandlers<T> = { [eventType: string]: EventHandler<T> }

function getHandler<T>(event: Event, handlers: EventHandlers<T>): EventHandler<T> {
  const handler = handlers[event.event_type]
  if (!handler)
    return (state: T, _) => state
  return handler
}

export function handleEvent<T>(state: T, event: Event, handlers: EventHandlers<T>): T {
  return getHandler<T>(event, handlers)(state, event)
}
