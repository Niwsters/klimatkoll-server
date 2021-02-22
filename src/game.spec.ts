import 'mocha'
import assert from 'assert'
import { GameState, GameEvent, Player } from './game'
import cards, { Card, CardData } from './cards'
import seedrandom = require('seedrandom');

function createDeck() {
  let lastCardID = 0
  return cards.map((card: CardData) => {
    return {
      ...card,
      id: lastCardID++
    }
  })
}

let lastServerEventID = 0
function createServerEvent(eventType: string, payload: any = {}): GameEvent {
  return new GameEvent(lastServerEventID++, eventType, payload)
}

describe('GameState', () => {
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

    lastServerEventID = 0
  })

  describe('getServerState', () => {
    let deck: Card[] = createDeck()
    const nextCard = () => {
      const card = deck.pop()
      if (!card) throw new Error("Deck ran out of cards")
      return card
    }
    beforeEach(() => {
      deck = createDeck()
    })

    it('shuffles deck based on seed', () => {
      const events: GameEvent[] = [
        createServerEvent("game_started", { seed: 'some-seed' })
      ]

      const state = GameState.fromEvents(events)

      assert.deepEqual(state.deck[0], {
        emissions: 250,
        id: 38,
        name: "rida"
      })
      assert.deepEqual(state.deck[7], {
        emissions: 350,
        id: 26,
        name: "ny-dator"
      })
      assert.deepEqual(state.deck[10], {
        emissions: 200,
        id: 33,
        name: "pendla-buss"
      })
    })

    it('sets player1 on first player connected', () => {
      const events: GameEvent[] = [
        createServerEvent("game_started", { seed: 'some-seed' }),
        createServerEvent("player_connected", { socketID: playerID })
      ]

      const state = GameState.fromEvents(events)

      assert.deepEqual(state.player1, {
        socketID: playerID,
        hand: []
      })
    })

    describe('second player connected (game started)', () => {
      const random = seedrandom('seeded')

      const events: GameEvent[] = [
        createServerEvent("player_connected", { socketID: playerID }),
      ]
      const beforeState = GameState.fromEvents(events)
      events.push(createServerEvent("player_connected", { socketID: opponentID }))
      const state = GameState.fromEvents(events)
      const clientEvents = state.clientEvents

      it('sets player2 on second player connect', () => {
        if (!state.player2) throw new Error("Player 2 is undefined")
        assert.deepEqual(state.player2.socketID, opponentID)
      })

      it('assigns player hands on second player connect', () => {
        const expectedP1Cards = [1,2,3].map(i => deck.pop()) 
        const expectedP2Cards = [1,2,3].map(i => deck.pop()) 

        if (!state.player1) throw new Error("Player 1 undefined")
        assert.deepEqual(state.player1.hand, expectedP1Cards)

        if (!state.player2) throw new Error("Player 2 undefined")
        assert.deepEqual(state.player2.hand, expectedP2Cards)
      })

      it('plays deck card to emissions line', () => {
        Array.of(1,2,3,4,5,6).forEach(() => deck.pop())

        const card = deck.pop()
        assert.deepEqual(state.deck, deck)
        assert.deepEqual(state.emissionsLine, [card])
      })

      it("sets player turn", () => {
        assert.equal(state.playerTurn, playerID)
      })

      it("notifies client of game start", () => {
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
          createTestEvent("player_turn", { socketID: playerID }),
          createTestEvent("next_card", { card: state.deck[state.deck.length - 1] })
        ])
      })
    })

    it('ignores third player', () => {
      const events: GameEvent[] = [
        createServerEvent("player_connected", { socketID: playerID }),
        createServerEvent("player_connected", { socketID: opponentID })
      ]

      const state = GameState.fromEvents(events)

      events.push(createServerEvent("player_connected", { socketID: 3 }))

      const state2 = GameState.fromEvents(events)

      assert.deepEqual(state2, state)
    })

    it("sets state to waiting_for_players on first player connected", () => {
      const events: GameEvent[] = [
        createServerEvent("player_connected", { socketID: playerID })
      ]

      const clientEvents = GameState.fromEvents(events).clientEvents

      assert.deepEqual(clientEvents, [
        createTestEvent("waiting_for_players")
      ])
    })

    it("ends game on disconnect", () => {
      const events: GameEvent[] = [
        createServerEvent('player_connected', { socketID: playerID }),
        createServerEvent('player_connected', { socketID: opponentID }),
        createServerEvent('player_disconnected', { socketID: opponentID })
      ]

      const clientEvents = GameState.fromEvents(events).clientEvents

      lastEventID = clientEvents.length - 1
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
        return createServerEvent('card_played_from_hand', {
          socketID: socketID,
          cardID: cardID,
          position: position
        })
      }

      beforeEach(() => {
        deck = createDeck()
        events = [
          createServerEvent('game_started', { seed: "some-seed" }),
          createServerEvent('player_connected', { socketID: playerID }),
          createServerEvent('player_connected', { socketID: opponentID }),
        ]
        const state = GameState.fromEvents(events)
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
          state = GameState.fromEvents(events)
        })

        it("sets next player's turn", () => {
          assert.equal(state.playerTurn, player2.socketID)
        })

        it("notifies client of turn change", () => {
          lastEventID = state.clientEvents.length - 2
          assert.deepEqual(state.clientEvents[state.clientEvents.length - 2], 
            createTestEvent("player_turn", { socketID: player2.socketID })
          )
        })
      })

      describe("incorrect player's turn", () => {
        let beforeState: GameState
        let state: GameState

        it("ignores event", () => {
          beforeState = GameState.fromEvents(events)
          events.push(playCardEvent(player2.hand[0].id, 0, player2.socketID))
          state = GameState.fromEvents(events)
          assert.deepEqual(state, beforeState)
        })
      })

      describe("game over", () => {
        let state: GameState
        let player1Before: Player
        let player2Before: Player
        beforeEach(() => {
          state = GameState.fromEvents(events)
          if (!state.player1) throw new Error("Player 1 is undefined")
          if (!state.player2) throw new Error("Player 2 is undefined")
          player1Before = state.player1
          player2Before = state.player2

          events.push(playCardEvent(player1Before.hand[0].id, 0, player1Before.socketID))
          events.push(playCardEvent(player2Before.hand[0].id, 4, player2Before.socketID))
          events.push(playCardEvent(player1Before.hand[1].id, 2, player1Before.socketID))
          events.push(playCardEvent(player2Before.hand[1].id, 4, player2Before.socketID))
          events.push(playCardEvent(player1Before.hand[2].id, 8, player1Before.socketID))

          state = GameState.fromEvents(events)
        })

        it("notifies clients of winning player", () => {
          const length = state.clientEvents.length
          lastEventID = length - 1
          assert.deepEqual(
            state.clientEvents[state.clientEvents.length - 1],
            createTestEvent("game_won", { socketID: player1.socketID }),
          )
        })

        it("does not allow cards to be played directly afterward", () => {
          const emissionsLineBefore = [...state.emissionsLine]
          const cardID = state.player2 ? state.player2.hand[0].id : 0
          events.push(playCardEvent(cardID, 6, player2.socketID))
          state = GameState.fromEvents(events)

          assert.deepEqual(state.emissionsLine, emissionsLineBefore)

          const length = state.clientEvents.length
          lastEventID = length - 1
          assert.deepEqual(
            state.clientEvents[state.clientEvents.length - 1],
            createTestEvent("game_won", { socketID: player1.socketID }),
          )
        })

        describe("vote new game", () => {
          beforeEach(() => {
            events.push(createServerEvent("vote_new_game", { socketID: player1.socketID }))

            state = GameState.fromEvents(events)           
          })

          it("notifies clients of player vote", () => {
            const length = state.clientEvents.length
            lastEventID = length - 1
            assert.deepEqual(
              state.clientEvents[state.clientEvents.length - 1],
              createTestEvent("vote_new_game", { socketID: player1.socketID }),
            )
          })
        })
      })

      describe("placement correct", () => {
        let card: Card
        let card2: Card
        let event: GameEvent
        let event2: GameEvent
        let state: GameState
        beforeEach(() => {
          state = GameState.fromEvents(events)
          card = player1.hand[0]
          card2 = player2.hand[2]
          event = playCardEvent(card.id, 0, player1.socketID)
          events.push(event)
          event2 = playCardEvent(card2.id, 2, player2.socketID)
          events.push(event2)
          
          state = GameState.fromEvents(events)
          if (!state.player1) throw new Error("Player 1 is undefined")
          if (!state.player2) throw new Error("Player 2 is undefined")
          player1 = state.player1
          player2 = state.player2
        })

        it("moves card to emissions line", () => {
          assert.deepEqual(state.emissionsLine, [card, card2, emissionsLineCard])
        })

        it("moves card from hand", () => {
          assert.deepEqual(player1.hand, player1.hand.filter(c => c != card))
          assert.deepEqual(player2.hand, player2.hand.filter(c => c != card2))
        })

        it("notifies client", () => {
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
        let player1Before: Player
        let player2Before: Player
        let player1: Player
        let player2: Player
        let newCard: Card

        beforeEach(() => {
          state = GameState.fromEvents(events)
          deckBefore = [...state.deck]
          deck = [...deckBefore]
          if (!state.player1) throw new Error("Player 1 is undefined")
          if (!state.player2) throw new Error("Player 2 is undefined")
          player1Before = state.player1
          player2Before = state.player2

          card = player1Before.hand[0]
          card2 = player2Before.hand[1]
          event = playCardEvent(card.id, 0, player1Before.socketID)
          events.push(event)
          event2 = playCardEvent(card2.id, 4, player2Before.socketID)
          events.push(event2)
          
          state = GameState.fromEvents(events)
          if (!state.player1) throw new Error("Player 1 is undefined")
          if (!state.player2) throw new Error("Player 2 is undefined")
          player1 = state.player1
          player2 = state.player2

          newCard = nextCard()
        })

        it("does NOT move card to emissions line", () => {
          assert.deepEqual(state.emissionsLine, [card, emissionsLineCard])
        })

        it("moves card from player's hand and deal new card to hand", () => {
          assert.deepEqual(
            player2.hand,
            [
              ...player2Before.hand.filter((c: Card) => c != card2),
              newCard
            ]
          )
        })

        it("moves card to bottom of deck", () => {
          assert.deepEqual(state.deck[0], card2)
        })

        it("notifies clients of changes", () => {
          const clientEvents = state.clientEvents
          const length = clientEvents.length
          lastEventID = state.clientEvents.length - 5
          assert.deepEqual(clientEvents.slice(length - 5, length), [
            createTestEvent("card_played_from_hand", event.payload),
            createTestEvent("player_turn", { socketID: playerID }),
            createTestEvent("incorrect_card_placement", { cardID: card2.id, socketID: opponentID }),
            createTestEvent("draw_card", { card: newCard, socketID: player2.socketID }),
            createTestEvent("next_card", { card: state.deck[state.deck.length - 1] })
          ])
        })
      })
    })
  })
})
