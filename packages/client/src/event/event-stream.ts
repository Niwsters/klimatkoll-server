import { StreamChannel } from '../stream';
import { Event, EventToAdd } from './event'

export class EventStream {
  private stream$: StreamChannel<Event> = new StreamChannel<Event>();
  private lastEventID = 0

  public next(event: EventToAdd): void {
    this.stream$.next({
      ...event,
      event_id: this.lastEventID++
    })
  }

  public subscribe(func: (e: Event) => void) {
    this.stream$.subscribe(func);
  }
}
