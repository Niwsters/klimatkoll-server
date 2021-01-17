import 'mocha'
import assert from 'assert'
import { GameEvent, EventHandler, GameState, Player } from './event'
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

    describe('second player connected (game started)', () => {
      const events: GameEvent[] = [
        EventHandler.createServerEvent("player_connected", { socketID: playerID }),
      ]
      const beforeState = EventHandler.getServerState(events)
      events.push(EventHandler.createServerEvent("player_connected", { socketID: opponentID }))
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

      it("should set player turn", () => {
        assert.equal(state.playerTurn, playerID)
      })

      it("should notify client of game start", () => {
        lastEventID = beforeState.clientEvents.length
        assert.deepEqual(clientEvents.slice(1,clientEvents.length), [
          createTestEvent("playing"),
          createTestEvent("draw_card", { card: nextCard(), socketID: playerID }),
          createTestEvent("draw_card", { card: nextCard(), socketID: playerID }),
          createTestEvent("draw_card", { card: nextCard(), socketID: playerID }),
          createTestEvent("draw_card", { card: nextCard(), socketID: opponentID }),
          createTestEvent("draw_card", { card: nextCard(), socketID: opponentID }),
          createTestEvent("draw_card", { card: nextCard(), socketID: opponentID }),
          createTestEvent("card_played_from_deck", { card: nextCard(), position: 0 }),
          createTestEvent("player_turn", { socketID: playerID })
        ])
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

      lastEventID = 10
      assert.deepEqual(
        clientEvents[clientEvents.length - 1],
        createTestEvent("opponent_disconnected")
      )
    })

    describe('card played from hand', () => {
      let events: GameEvent[]
      let player1: Player
      let player2: Player
      let emissionsLineCard: Card
      const playCardEvent = (
        cardID: number,
        position: number,
        socketID: number
      ): GameEvent => {
        return EventHandler.createServerEvent('card_played_from_hand', {
          socketID: socketID,
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
        if (state.player1) player1 = state.player1
        if (state.player2) player2 = state.player2
        if (!player1) throw new Error("Player 1 is undefined")
        if (!player2) throw new Error("Player 2 is undefined")

        emissionsLineCard = state.emissionsLine[0]
      })

      describe("correct player's turn", () => {
        let state: GameState
        
        beforeEach(() => {
          events.push(playCardEvent(player1.hand[0].id, 0, player1.socketID))
          state = EventHandler.getServerState(events)
        })

        it("should set to next player's turn", () => {
          assert.equal(state.playerTurn, player2.socketID)
        })

        it("should notify client of turn change", () => {
          lastEventID = 10
          assert.deepEqual(state.clientEvents[10], 
            createTestEvent("player_turn", { socketID: player2.socketID })
          )
        })
      })

      describe("incorrect player's turn", () => {
        let beforeState: GameState
        let state: GameState

        it("ignores event", () => {
          beforeState = EventHandler.getServerState(events)
          events.push(playCardEvent(player2.hand[0].id, 0, player2.socketID))
          state = EventHandler.getServerState(events)
          assert.deepEqual(state, beforeState)
        })
      })

      describe("placement correct", () => {
        let card: Card
        let card2: Card
        let event: GameEvent
        let event2: GameEvent
        let state: GameState
        beforeEach(() => {
          state = EventHandler.getServerState(events)
          card = player1.hand[0]
          card2 = player2.hand[2]
          event = playCardEvent(card.id, 0, player1.socketID)
          events.push(event)
          event2 = playCardEvent(card2.id, 2, player2.socketID)
          events.push(event2)
          
          state = EventHandler.getServerState(events)
          if (!state.player1) throw new Error("Player 1 is undefined")
          if (!state.player2) throw new Error("Player 2 is undefined")
          player1 = state.player1
          player2 = state.player2
        })

        it("should move card to emissions line", () => {
          assert.deepEqual(state.emissionsLine, [card, card2, emissionsLineCard])
        })

        it("should move card from hand", () => {
          assert.deepEqual(player1.hand, player1.hand.filter(c => c != card))
          assert.deepEqual(player2.hand, player2.hand.filter(c => c != card2))
        })

        it("should notify client", () => {
          const clientEvents = state.clientEvents
          const length = clientEvents.length
          lastEventID = length - 3
          assert.deepEqual(clientEvents.slice(length - 3, length), [
            createTestEvent("card_played_from_hand", event.payload),
            createTestEvent("player_turn", { socketID: playerID }),
            createTestEvent("card_played_from_hand", event2.payload)
          ])
        })
      })

      describe('placement incorrect', () => {
        let card: Card
        let card2: Card
        let event: GameEvent
        let event2: GameEvent
        let state: GameState
        let deckBefore: Card[]

        beforeEach(() => {
          state = EventHandler.getServerState(events)
          deckBefore = state.deck

          card = player1.hand[0]
          card2 = player2.hand[2]
          event = playCardEvent(card.id, 0, player1.socketID)
          events.push(event)
          event2 = playCardEvent(card2.id, 4, player2.socketID)
          events.push(event2)
          
          state = EventHandler.getServerState(events)
        })

        it("should NOT move card to emissions line", () => {
          assert.deepEqual(state.emissionsLine, [card, emissionsLineCard])
        })

        it("should move card from player's hand", () => {
          const player = state.player2
          if (!player) throw new Error("Player is undefined")
          assert.deepEqual(
            player.hand,
            player.hand.filter((c: Card) => c != card && c != card2)
          )
        })

        it("should move card to bottom of deck", () => {
          assert.deepEqual(state.deck, [card2, ...deckBefore])
        })

        it("should notify clients of incorrect card placement", () => {
          const clientEvents = state.clientEvents
          const length = clientEvents.length
          lastEventID = state.clientEvents.length - 3
          assert.deepEqual(clientEvents.slice(length - 3, length), [
            createTestEvent("card_played_from_hand", event.payload),
            createTestEvent("player_turn", { socketID: playerID }),
            createTestEvent("incorrect_card_placement", { cardID: card2.id, socketID: opponentID })
          ])
        })
      })
    })
  })
})
