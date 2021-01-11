import 'mocha'
import assert from 'assert'
import { GameEvent, EventHandler } from './event'
import { Card } from './cards'

describe('EventHandler', () => {
  let deck: Card[] = []

  beforeEach(() => {
    deck = [
      {
        emissions: 100,
        name: "blargh"
      },
      {
        emissions: 99,
        name: "honk"
      },
      {
        emissions: 124,
        name: "test"
      },
      {
        emissions: 150,
        name: "test2"
      }
    ]

    EventHandler.deck = deck
    EventHandler.lastServerEventID = 0
  })

  describe('createServerEvent', () => {
    it('should return object with correct parameters', () => {
      const event = EventHandler.createServerEvent('type', { test: 'payload' })

      assert.deepEqual(event, {
        event_id: 0,
        event_type: 'type',
        payload: { test: 'payload' }
      })
    })

    it('should return default payload', () => {
      const event = EventHandler.createServerEvent('type')

      assert.deepEqual(event, {
        event_id: 0,
        event_type: 'type',
        payload: {}
      })
    })

    it('should increment event_id', () => {
      const event = EventHandler.createServerEvent('type')
      const event2 = EventHandler.createServerEvent('type2')

      assert.equal(event.event_id, 0)
      assert.equal(event2.event_id, 1)
    })
  })

  describe('getClientEvents', () => {
    const playerID = 0
    const opponentID = 1

    it("should assign player's cards on connection", () => {
      const expectedCard = deck[deck.length - 1]

      const events: GameEvent[] = [
        EventHandler.createServerEvent('player_connected', { socketID: playerID })
      ]

      const clientEvents = EventHandler.getClientEvents(events, playerID)

      assert.deepEqual(clientEvents, [
        {
          event_type: "draw_card",
          event_id: 0,
          payload: {
            card: expectedCard
          }
        }
      ])
    })

    it("should assign opponent's cards on connection", () => {
      const events: GameEvent[] = [
        EventHandler.createServerEvent('player_connected', { socketID: opponentID })
      ]

      const expectedCard = deck[deck.length - 1]

      const clientEvents = EventHandler.getClientEvents(events, playerID)

      assert.deepEqual(clientEvents, [
        {
          event_type: "draw_opponent_card",
          event_id: 0,
          payload: {
            card: expectedCard
          }
        }
      ])
    })

    it("should return opponent's card on disconnect", () => {
      const events: GameEvent[] = [
        EventHandler.createServerEvent('player_connected', { socketID: playerID }),
        EventHandler.createServerEvent('player_connected', { socketID: opponentID }),
        EventHandler.createServerEvent('player_disconnected', { socketID: opponentID })
      ]

      const expectedCard = deck[deck.length - 1]
      const expectedCard2 = deck[deck.length - 2]

      const clientEvents = EventHandler.getClientEvents(events, playerID)

      assert.deepEqual(clientEvents, [
        {
          event_type: "draw_card",
          event_id: 0,
          payload: {
            card: expectedCard
          }
        },
        {
          event_type: "draw_opponent_card",
          event_id: 1,
          payload: {
            card: expectedCard2
          }
        },
        {
          event_type: "return_opponent_hand",
          event_id: 2,
          payload: {}
        }
      ])
    })

    it('should not give cards to a third player', () => {
      const events: GameEvent[] = [
        EventHandler.createServerEvent('player_connected', { socketID: playerID }),
        EventHandler.createServerEvent('player_connected', { socketID: opponentID }),
        EventHandler.createServerEvent('player_connected', { socketID: 2 }),
        EventHandler.createServerEvent('player_disconnected', { socketID: opponentID })
      ]

      const expectedCard = deck[deck.length - 1]
      const expectedCard2 = deck[deck.length - 2]

      const clientEvents = EventHandler.getClientEvents(events, playerID)

      assert.deepEqual(clientEvents, [
        {
          event_type: "draw_card",
          event_id: 0,
          payload: {
            card: expectedCard
          }
        },
        {
          event_type: "draw_opponent_card",
          event_id: 1,
          payload: {
            card: expectedCard2
          }
        },
        {
          event_type: "return_opponent_hand",
          event_id: 2,
          payload: {}
        }
      ])
    })
  })
})
