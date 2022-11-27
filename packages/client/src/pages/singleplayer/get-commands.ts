import { EventToAdd } from '@shared/events';
import { playCardRequest } from './play-card-request'
import { SPState } from './sp-state';

export type NoEvent = undefined;
export const NO_EVENT: NoEvent = undefined

export function getCommands(state: SPState, event: EventToAdd): EventToAdd[] | NoEvent {
  switch (event.event_type) {
    case "play_card_request":
      return playCardRequest(state, event)
    default:
      return NO_EVENT
  }
}
