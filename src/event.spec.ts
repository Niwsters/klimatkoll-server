import 'mocha'
import assert from 'assert'
import { GameEvent, EventHandler } from './event'
import cards, { Card } from './cards'

describe('EventHandler', () => {
  let deck: Card[] = [...cards]
  let lastEventID = 0
  const playerID = 0
  const opponentID = 1

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

  describe('getServerState', () => {
    let lastCard = 0
    let deck = [...cards]
    const nextCard = (deck: Card[]) => deck[deck.length - (lastCard++)]
    beforeEach(() => {
      lastCard = deck.length - 1
      deck = [...cards]
    })

    it('should set player1 on first player connect', () => {
      const events: GameEvent[] = [
        EventHandler.createServerEvent("player_connected", { socketID: playerID })
      ]

      const state = EventHandler.getServerState(events)

      assert.deepEqual(state.player1, {
        socketID: playerID,
        hand: []
      })
    })

    it('should set player2 on second player connect', () => {
      const events: GameEvent[] = [
        EventHandler.createServerEvent("player_connected", { socketID: playerID }),
        EventHandler.createServerEvent("player_connected", { socketID: opponentID })
      ]

      const state = EventHandler.getServerState(events)

      if (!state.player2) throw new Error("Player 2 is undefined")
      assert.deepEqual(state.player2.socketID, opponentID)
    })

    it('should assign player hands on second player connect', () => {
      const events: GameEvent[] = [
        EventHandler.createServerEvent("player_connected", { socketID: playerID }),
        EventHandler.createServerEvent("player_connected", { socketID: opponentID })
      ]

      const state = EventHandler.getServerState(events)

      const expectedP1Cards = [1,2,3].map(i => deck.pop()) 
      const expectedP2Cards = [1,2,3].map(i => deck.pop()) 

      if (!state.player1) throw new Error("Player 1 undefined")
      assert.deepEqual(state.player1.hand, expectedP1Cards)

      if (!state.player2) throw new Error("Player 2 undefined")
      assert.deepEqual(state.player2.hand, expectedP2Cards)
    })

    it('should ignore third player', () => {
      const events: GameEvent[] = [
        EventHandler.createServerEvent("player_connected", { socketID: playerID }),
        EventHandler.createServerEvent("player_connected", { socketID: opponentID })
      ]

      const state = EventHandler.getServerState(events)

      events.push(EventHandler.createServerEvent("player_connected", { socketID: 3 }))

      const state2 = EventHandler.getServerState(events)

      assert.deepEqual(state2, state)
    })
  })

  describe('getClientEvents', () => {
    let lastCard = deck.length - 1
    const nextCard = () => deck.pop()

    beforeEach(() => {
      deck = [...cards]
      lastCard = deck.length - 1
    })

    it("should set state to waiting_for_players on first player connection", () => {
      const events: GameEvent[] = [
        EventHandler.createServerEvent("player_connected", { socketID: playerID })
      ]

      const clientEvents = EventHandler.getServerState(events).clientEvents

      assert.deepEqual(clientEvents, [
        createTestEvent("waiting_for_players")
      ])
    })

    it("should draw hands on second player connection", () => {
      const events: GameEvent[] = [
        EventHandler.createServerEvent('player_connected', { socketID: playerID }),
        EventHandler.createServerEvent('player_connected', { socketID: opponentID })
      ]

      const clientEvents = EventHandler.getServerState(events).clientEvents

      const card1 = nextCard()
      const card2 = nextCard()
      const card3 = nextCard()
      const card4 = nextCard()
      const card5 = nextCard()
      const card6 = nextCard()

      assert.deepEqual(clientEvents, [
        createTestEvent("waiting_for_players"),
        createTestEvent("playing"),
        createTestEvent("draw_card", { card: card1, socketID: playerID }),
        createTestEvent("draw_card", { card: card2, socketID: playerID }),
        createTestEvent("draw_card", { card: card3, socketID: playerID }),
        createTestEvent("draw_card", { card: card4, socketID: opponentID }),
        createTestEvent("draw_card", { card: card5, socketID: opponentID }),
        createTestEvent("draw_card", { card: card6, socketID: opponentID }),
      ])
    })

    it("should end game on disconnect", () => {
      const events: GameEvent[] = [
        EventHandler.createServerEvent('player_connected', { socketID: playerID }),
        EventHandler.createServerEvent('player_connected', { socketID: opponentID }),
        EventHandler.createServerEvent('player_disconnected', { socketID: opponentID })
      ]

      const clientEvents = EventHandler.getServerState(events).clientEvents

      assert.deepEqual(clientEvents, [
        createTestEvent("waiting_for_players"),
        createTestEvent("playing"),
        createTestEvent("draw_card", { card: nextCard(), socketID: playerID }),
        createTestEvent("draw_card", { card: nextCard(), socketID: playerID }),
        createTestEvent("draw_card", { card: nextCard(), socketID: playerID }),
        createTestEvent("draw_card", { card: nextCard(), socketID: opponentID }),
        createTestEvent("draw_card", { card: nextCard(), socketID: opponentID }),
        createTestEvent("draw_card", { card: nextCard(), socketID: opponentID }),
        createTestEvent("opponent_disconnected")
      ])
    })

    it('should ignore third player', () => {
      const events: GameEvent[] = [
        EventHandler.createServerEvent('player_connected', { socketID: playerID }),
        EventHandler.createServerEvent('player_connected', { socketID: opponentID }),
        EventHandler.createServerEvent('player_connected', { socketID: 2 })
      ]

      const clientEvents = EventHandler.getServerState(events).clientEvents

      assert.deepEqual(clientEvents, [
        createTestEvent("waiting_for_players"),
        createTestEvent("playing"),
        createTestEvent("draw_card", { card: nextCard(), socketID: playerID }),
        createTestEvent("draw_card", { card: nextCard(), socketID: playerID }),
        createTestEvent("draw_card", { card: nextCard(), socketID: playerID }),
        createTestEvent("draw_card", { card: nextCard(), socketID: opponentID }),
        createTestEvent("draw_card", { card: nextCard(), socketID: opponentID }),
        createTestEvent("draw_card", { card: nextCard(), socketID: opponentID }),
      ])
    })
  })
})
