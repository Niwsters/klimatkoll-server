import 'mocha'
import assert from 'assert'
import { GameEvent, EventHandler } from './event'
import cards, { Card, CardData } from './cards'

function createDeck() {
  let lastCardID = 0
  return cards.map((card: CardData) => {
    return {
      ...card,
      id: lastCardID++
    }
  })
}

describe('EventHandler', () => {
  let deck: Card[] = createDeck()
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
    deck = createDeck()

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
    let deck: Card[] = createDeck()
    const nextCard = () => deck.pop()
    beforeEach(() => {
      deck = createDeck()
    })

    it('should set player1 on first player connected', () => {
      const events: GameEvent[] = [
        EventHandler.createServerEvent("player_connected", { socketID: playerID })
      ]

      const state = EventHandler.getServerState(events)

      assert.deepEqual(state.player1, {
        socketID: playerID,
        hand: []
      })
    })

    describe('second player connected', () => {
      const events: GameEvent[] = [
        EventHandler.createServerEvent("player_connected", { socketID: playerID }),
        EventHandler.createServerEvent("player_connected", { socketID: opponentID })
      ]
      const state = EventHandler.getServerState(events)
      const clientEvents = state.clientEvents

      it('should set player2 on second player connect', () => {
        if (!state.player2) throw new Error("Player 2 is undefined")
        assert.deepEqual(state.player2.socketID, opponentID)
      })

      it('should assign player hands on second player connect', () => {
        const expectedP1Cards = [1,2,3].map(i => deck.pop()) 
        const expectedP2Cards = [1,2,3].map(i => deck.pop()) 

        if (!state.player1) throw new Error("Player 1 undefined")
        assert.deepEqual(state.player1.hand, expectedP1Cards)

        if (!state.player2) throw new Error("Player 2 undefined")
        assert.deepEqual(state.player2.hand, expectedP2Cards)
      })

      it('should play deck card to emissions line', () => {
        Array.of(1,2,3,4,5,6).forEach(() => deck.pop())

        const card = deck.pop()
        assert.deepEqual(state.deck, deck)
        assert.deepEqual(state.emissionsLine, [card])
      })

      it("should set playing cycle", () => {
        lastEventID = 1
        assert.deepEqual(clientEvents[1], createTestEvent("playing"))
      })

      it("should draw hands", () => {
        lastEventID = 2
        assert.deepEqual(clientEvents.slice(2,8), [
          createTestEvent("draw_card", { card: nextCard(), socketID: playerID }),
          createTestEvent("draw_card", { card: nextCard(), socketID: playerID }),
          createTestEvent("draw_card", { card: nextCard(), socketID: playerID }),
          createTestEvent("draw_card", { card: nextCard(), socketID: opponentID }),
          createTestEvent("draw_card", { card: nextCard(), socketID: opponentID }),
          createTestEvent("draw_card", { card: nextCard(), socketID: opponentID }),
        ])
      })

      it("should play card to emissions line", () => {
        lastEventID = 8
        Array.of(0,0,0,0,0,0).forEach(() => nextCard())
        assert.deepEqual(
          clientEvents[8],
          createTestEvent("card_played_from_deck", { card: nextCard(), position: 0 })
        )
      })
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

    it("should set state to waiting_for_players on first player connected", () => {
      const events: GameEvent[] = [
        EventHandler.createServerEvent("player_connected", { socketID: playerID })
      ]

      const clientEvents = EventHandler.getServerState(events).clientEvents

      assert.deepEqual(clientEvents, [
        createTestEvent("waiting_for_players")
      ])
    })

    it("should end game on disconnect", () => {
      const events: GameEvent[] = [
        EventHandler.createServerEvent('player_connected', { socketID: playerID }),
        EventHandler.createServerEvent('player_connected', { socketID: opponentID }),
        EventHandler.createServerEvent('player_disconnected', { socketID: opponentID })
      ]

      const clientEvents = EventHandler.getServerState(events).clientEvents

      lastEventID = 9
      assert.deepEqual(
        clientEvents[clientEvents.length - 1],
        createTestEvent("opponent_disconnected")
      )
    })

    it('should ignore third player', () => {
      const events: GameEvent[] = [
        EventHandler.createServerEvent('player_connected', { socketID: playerID }),
        EventHandler.createServerEvent('player_connected', { socketID: opponentID }),
      ]

      const beforeEvents = EventHandler.getServerState(events).clientEvents

      events.push(EventHandler.createServerEvent('player_connected', { socketID: 2 }))

      const clientEvents = EventHandler.getServerState(events).clientEvents

      assert.deepEqual(clientEvents, beforeEvents)
    })

    describe('card played from hand', () => {
      let events: GameEvent[]
      let hand: Card[]
      let emissionsLineCard: Card
      const playCardEvent = (
        cardID: number,
        position: number,
        socketID: number = playerID
      ): GameEvent => {
        return EventHandler.createServerEvent('card_played_from_hand', {
          socketID: opponentID, // opponentID has better cards
          cardID: cardID,
          position: position
        })
      }

      beforeEach(() => {
        deck = createDeck()
        events = [
          EventHandler.createServerEvent('player_connected', { socketID: playerID }),
          EventHandler.createServerEvent('player_connected', { socketID: opponentID }),
        ]
        const state = EventHandler.getServerState(events)
        const player2 = state.player2
        if (!player2) throw new Error("Player 1 is undefined")
        hand = player2.hand
        console.log(hand)

        emissionsLineCard = state.emissionsLine[0]
      })

      it("should move card from hand to emissions line (position == 0)", () => {
        const card = hand[0]

        const event = playCardEvent(card.id, 0)
        events.push(event)

        const state = EventHandler.getServerState(events)
        const clientEvents = state.clientEvents

        assert.deepEqual(state.emissionsLine, [card, state.emissionsLine[1]])

        lastEventID = 9
        assert.deepEqual(clientEvents[clientEvents.length - 1], 
          createTestEvent("card_played_from_hand", event.payload)
        )
      })

      it("should move card from hand to emissions line (position == 2)", () => {
        const card = hand[1]
        const card2 = hand[2]

        const event = playCardEvent(card.id, 0)
        events.push(event)
        const event2 = playCardEvent(card2.id, 2)
        events.push(event2)

        const state = EventHandler.getServerState(events)
        const clientEvents = state.clientEvents

        assert.deepEqual(state.emissionsLine, [card, card2, emissionsLineCard])

        lastEventID = 9
        const length = clientEvents.length
        assert.deepEqual(clientEvents.slice(length - 2, length), [
          createTestEvent("card_played_from_hand", event.payload),
          createTestEvent("card_played_from_hand", event2.payload)
        ])
      })

      it("should NOT move card from hand to emissions line if position is incorrect", () => {
        const card = hand[0]
        const card2 = hand[2]

        const event = playCardEvent(card.id, 0)
        events.push(event)
        const event2 = playCardEvent(card2.id, 4)
        events.push(event2)

        const state = EventHandler.getServerState(events)
        const clientEvents = state.clientEvents

        assert.deepEqual(state.emissionsLine, [card, emissionsLineCard])

        lastEventID = 9
        const length = clientEvents.length
        assert.deepEqual(clientEvents.slice(length - 2, length), [
          createTestEvent("card_played_from_hand", event.payload),
          createTestEvent("incorrect_card_placement")
        ])
      })
    })
  })
})
