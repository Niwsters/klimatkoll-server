import 'mocha'
import assert from 'assert'
import { GameEvent, EventHandler } from './event'
import cards, { Card } from './cards'

describe('EventHandler', () => {
  let deck: Card[] = [...cards]
  let lastEventID = 0

  const createTestEvent = (type: string, payload: any = {}) => {
    return {
      event_id: lastEventID++,
      event_type: type,
      payload: payload
    }
  }

  beforeEach(() => {
    lastEventID = 0
    deck = [...cards]

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
    let lastCard = deck.length - 1
    const nextCard = () => deck[lastCard--]

    beforeEach(() => {
      lastCard = deck.length - 1
      deck = [...cards]
    })

    it("should set state to waiting_for_players on first player connection", () => {
      const events: GameEvent[] = [
        EventHandler.createServerEvent("player_connected", { socketID: playerID })
      ]

      const clientEvents = EventHandler.getClientEvents(events, playerID)

      assert.deepEqual(clientEvents, [
        createTestEvent("waiting_for_players")
      ])
    })

    it("should draw hands on second player connection", () => {
      const events: GameEvent[] = [
        EventHandler.createServerEvent('player_connected', { socketID: playerID }),
        EventHandler.createServerEvent('player_connected', { socketID: opponentID })
      ]

      const clientEvents = EventHandler.getClientEvents(events, playerID)

      assert.deepEqual(clientEvents, [
        createTestEvent("waiting_for_players"),
        createTestEvent("playing"),
        createTestEvent("draw_card", { card: nextCard() }),
        createTestEvent("draw_card", { card: nextCard() }),
        createTestEvent("draw_card", { card: nextCard() }),
        createTestEvent("draw_opponent_card", { card: nextCard() }),
        createTestEvent("draw_opponent_card", { card: nextCard() }),
        createTestEvent("draw_opponent_card", { card: nextCard() })
      ])
    })

    it("should return opponent's card on disconnect", () => {
      const events: GameEvent[] = [
        EventHandler.createServerEvent('player_connected', { socketID: playerID }),
        EventHandler.createServerEvent('player_connected', { socketID: opponentID }),
        EventHandler.createServerEvent('player_disconnected', { socketID: opponentID })
      ]

      const clientEvents = EventHandler.getClientEvents(events, playerID)

      assert.deepEqual(clientEvents, [
        createTestEvent("waiting_for_players"),
        createTestEvent("playing"),
        createTestEvent("draw_card", { card: nextCard() }),
        createTestEvent("draw_card", { card: nextCard() }),
        createTestEvent("draw_card", { card: nextCard() }),
        createTestEvent("draw_opponent_card", { card: nextCard() }),
        createTestEvent("draw_opponent_card", { card: nextCard() }),
        createTestEvent("draw_opponent_card", { card: nextCard() }),
        createTestEvent("return_opponent_hand")
      ])
    })

    it('should ignore third player', () => {
      const events: GameEvent[] = [
        EventHandler.createServerEvent('player_connected', { socketID: playerID }),
        EventHandler.createServerEvent('player_connected', { socketID: opponentID }),
        EventHandler.createServerEvent('player_connected', { socketID: 2 })
      ]

      const clientEvents = EventHandler.getClientEvents(events, playerID)

      assert.deepEqual(clientEvents, [
        createTestEvent("waiting_for_players"),
        createTestEvent("playing"),
        createTestEvent("draw_card", { card: nextCard() }),
        createTestEvent("draw_card", { card: nextCard() }),
        createTestEvent("draw_card", { card: nextCard() }),
        createTestEvent("draw_opponent_card", { card: nextCard() }),
        createTestEvent("draw_opponent_card", { card: nextCard() }),
        createTestEvent("draw_opponent_card", { card: nextCard() }),
      ])
    })
  })
})
