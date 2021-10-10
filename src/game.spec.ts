import 'mocha'
import assert from 'assert'
import { GameState, GameEvent, Player } from './game'
import { Card, CardData } from './cards'
import cards from './cards-sv'
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

function createCard(id: number, name: string, emissions: number): Card {
  return {
    id: id,
    name: name,
    emissions: emissions
  }
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

  describe('new', () => {
    it('creates gamestate with given seed, deck, and player', () => {
      const events: GameEvent[] = [
        createServerEvent("game_started", { seed: 'some-seed', deck: deck }),
        createServerEvent("player_connected", { socketID: 3 })
      ]
      const state = GameState.new('some-seed', deck, 3)
      assert.deepEqual(state, {
        ...new GameState(),
        deck: GameState.shuffle(deck, 'some-seed'),
        player1: new Player(3),
        clientEvents: [
          new GameEvent(0, 'waiting_for_players')
        ]
      })
    })
  })

  describe('shuffle', () => {
    it('shuffles given deck with given seed', () => {
      const result = GameState.shuffle(deck, 'some-seed')

      assert.deepEqual(result[0], {
        emissions: 250,
        id: 38,
        name: "rida"
      })
      assert.deepEqual(result[7], {
        emissions: 350,
        id: 26,
        name: "ny-dator"
      })
      assert.deepEqual(result[10], {
        emissions: 200,
        id: 33,
        name: "pendla-buss"
      })
    })
  })

  describe('gameStarted', () => {
    it('sets state.deck to shuffled given deck', () => {
      const deck = createDeck()
      const state = new GameState()
      const expected = GameState.shuffle(deck, 'some-seed')
      const result = GameState.gameStarted(new GameState(), { seed: 'some-seed', deck: deck })
      assert.deepEqual(result, {...state, deck: expected})
    })
  })

  describe('createClientEvent', () => {
    it('creates client event with given type and payload', () => {
      const state = new GameState()
      const result = GameState.createClientEvent(state, "blargh", { honk: "1337" })
      assert.deepEqual(result, {
        ...state, 
        clientEvents: [createTestEvent("blargh", { honk: "1337"})]
      })
    })

    it('assigns rising event IDs', () => {
      let state = new GameState()
      state = GameState.createClientEvent(state, "blargh", { honk: "1337" })
      const result = GameState.createClientEvent(state, "blargh", { honk: "1337" })
      assert.deepEqual(result, {
        ...state,
        clientEvents: [
          ...state.clientEvents,
          new GameEvent(1, "blargh", { honk: "1337" })
        ]
      })
    })
  })

  describe('getPlayer', () => {
    it('returns player with given socket ID', () => {
      let state = new GameState()
      state.player1 = new Player(1)
      state.player2 = new Player(2)

      assert.deepEqual(GameState.getPlayer(state, 1), state.player1)
      assert.deepEqual(GameState.getPlayer(state, 2), state.player2)
    })
  })

  describe('getOpponent', () => {
    it('returns the socketID of the other player', () => {
      let state = new GameState()
      state.player1 = new Player(1)
      state.player2 = new Player(2)
      assert.deepEqual(GameState.getOpponent(state, 1), state.player2)
      assert.deepEqual(GameState.getOpponent(state, 2), state.player1)
    })
  })

  describe('setPlayerTurn', () => {
    let state: GameState
    let player1: Player
    let player2: Player
    beforeEach(() => {
      state = new GameState()
      state.player1 = { socketID: 2, hand: [] }
      state.player2 = { socketID: 3, hand: [] }
      player1 = state.player1
      player2 = state.player2
    })
    it('sets player turn and notifies client', () => {
      let result = GameState.setPlayerTurn(state, player1.socketID)
      let expected: GameState = {
        ...state,
        playerTurn: player1.socketID
      }
      expected = GameState.createClientEvent(expected,
        "player_turn",
        { socketID: player1.socketID }
      )
      assert.deepEqual(result, expected)
    })

    it("set player 2's turn", () => {
      let result = GameState.setPlayerTurn(state, player2.socketID)
      let expected: GameState = {
        ...state,
        playerTurn: player2.socketID
      }
      expected = GameState.createClientEvent(expected,
        "player_turn",
        { socketID: player2.socketID }
      )
      assert.deepEqual(result, expected)
    })
  })

  describe('playerConnected', () => {
    it('assigns player1 if no player is connected', () => {
      const state = new GameState()
      const result = GameState.playerConnected(state, { socketID: 'blargh' })
      assert.deepEqual(result, {
        ...state,
        player1: {
          socketID: 'blargh',
          hand: []
        },
        clientEvents: [createTestEvent("waiting_for_players")]
      })
    })

    it('assigns player2 if player1 already connected, and starts game', () => {
      const state = GameState.playerConnected(new GameState(), { socketID: 2 })
      state.deck = createDeck()
      let result = GameState.playerConnected(state, { socketID: 3 })

      let expected = {...state}
      expected.player2 = {
        socketID: 3,
        hand: []
      }
      const player1 = new Player(2)
      const player2 = new Player(3)
      expected = GameState.createClientEvent(expected, "playing")
      expected = GameState.drawCard(expected, player1.socketID)
      expected = GameState.drawCard(expected, player1.socketID)
      expected = GameState.drawCard(expected, player1.socketID)
      expected = GameState.drawCard(expected, player2.socketID)
      expected = GameState.drawCard(expected, player2.socketID)
      expected = GameState.drawCard(expected, player2.socketID)
      expected = GameState.setPlayerTurn(expected, player1.socketID)
      expected = GameState.playCardFromDeck(expected)

      assert.deepEqual(result, expected)
    })

    it('ignores if all players already set', () => {
      let state = GameState.playerConnected(new GameState(), { socketID: 'blargh' })
      state = GameState.playerConnected(state, { socketID: 'honk' })
      const result = GameState.playerConnected(state, { socketID: 'test' })
      assert.deepEqual(result, state)
    })
  })

  describe('drawCard', () => {
    it('draws card for player1', () => {
      const state = new GameState()
      state.deck = createDeck()
      state.player1 = new Player(3)
      const result = GameState.drawCard(state, state.player1.socketID)
      const card = createDeck().pop()
      assert.deepEqual(result.player1, {
        ...state.player1,
        hand: [
          ...state.player1.hand,
          card
        ]
      })
      assert.deepEqual(result.deck, state.deck.slice(0, state.deck.length-1))
      assert.deepEqual(result.clientEvents, [
        ...state.clientEvents,
        new GameEvent(0, "draw_card", {
          card: card, socketID: state.player1.socketID
        }),
        new GameEvent(1, "next_card", {
          card: state.deck[state.deck.length - 2]
        })
      ])
    })

    it('draws card for player2', () => {
      const state = new GameState()
      state.deck = createDeck()
      state.player2 = new Player(3)
      const result = GameState.drawCard(state, state.player2.socketID)
      assert.deepEqual(result.player2, {
        ...state.player2,
        hand: [
          ...state.player2.hand,
          createDeck().pop()
        ]
      })
      assert.deepEqual(result.deck, state.deck.slice(0, state.deck.length-1))
    })
  })

  describe('playCardFromDeck', () => {
    it('plays card from top of deck to emissions line and notifies client', () => {
      const state = new GameState()

      const card1 = createCard(0, "blargh", 10)
      const card2 = createCard(1, "honk", 20)
      const card3 = createCard(2, "1337", 30)

      state.deck = [card1, card2, card3]
      let result = GameState.playCardFromDeck(state)
      
      let expected = {
        ...state,
        emissionsLine: [card3],
        deck: [card1, card2],
        clientEvents: [
          new GameEvent(0, "card_played_from_deck", {
            card: card3, position: 0
          }),
          new GameEvent(1, "next_card", {
            card: card2
          })
        ]
      }
      assert.deepEqual(result, expected)
    })
  })

  describe('playCard', () => {
    const card1 = createCard(0, "blargh", 10)
    const card2 = createCard(1, "honk", 20)
    const card3 = createCard(2, "1337", 30)
    const card4 = createCard(3, "a", 40)
    const card5 = createCard(4, "b", 50)
    let state: GameState
    let player1: Player
    let player2: Player
    beforeEach(() => {
      state = new GameState()
      state.player1 = new Player(1)
      state.player2 = new Player(2)
      state.playerTurn = state.player1.socketID
      player1 = state.player1
      player2 = state.player2
      player1.hand = [card1, card2]
      player2.hand = [card1, card2]
    })

    it("does nothing if it is not player's turn (player 1)", () => {
      state.playerTurn = player2.socketID
      player1.hand = [
        card1,
        card2
      ]
      let result = GameState.playCard(state, player1.socketID, card1.id, 0)
      assert.deepEqual(result, state)
    })

    it("does nothing if it is not player's turn (player 2)", () => {
      state.playerTurn = player1.socketID
      player2.hand = [
        card1,
        card2
      ]
      let result = GameState.playCard(state, player2.socketID, card1.id, 0)
      assert.deepEqual(result, state)
    })

    it("does nothing if either player's hand is empty (i.e. game won)", () => {
      player2.hand = [card1]
      player1.hand = []
      let result = GameState.playCard(state, player1.socketID, card1.id, 0)
      assert.deepEqual(result, state)

      player1.hand = [card1]
      player2.hand = []
      result = GameState.playCard(state, player1.socketID, card1.id, 0)
      assert.deepEqual(result, state)
    })

    it("sets turn to other player's turn", () => {
      let result = GameState.playCard(state, player1.socketID, card1.id, 0)
      assert.deepEqual(result.playerTurn, player2.socketID)
    })

    it('notifies players if someone won', () => {
      player1.hand = [card1]
      let result = GameState.playCard(state, player1.socketID, card1.id, 0)
      let expected = GameState.createClientEvent(state, "card_played_from_hand", {
        cardID: card1.id,
        socketID: player1.socketID,
        position: 0
      })
      expected = GameState.createClientEvent(expected, "player_turn", { socketID: player2.socketID })
      expected = GameState.createClientEvent(expected, "game_won", { socketID: player1.socketID })
      assert.deepEqual(result.clientEvents, expected.clientEvents)
    })

    it('plays card from player hand to emissions line', () => {
      player1.hand = [
        card1, card2
      ]
      let result = GameState.playCard(state, player1.socketID, card1.id, 0)
      assert.deepEqual(result.emissionsLine, [card1])
      assert.deepEqual(result.player1, { ...state.player1, hand: [card2] })
    })

    it('plays card from player 2 hand to emissions line', () => {
      state.playerTurn = player2.socketID
      player2.hand = [
        card1,
        card2
      ]
      let result = GameState.playCard(state, player2.socketID, card1.id, 0)
      assert.deepEqual(result.emissionsLine, [card1])
      assert.deepEqual(result.player2, { ...state.player2, hand: [card2] })
    })

    it('notifies client of played card and player turn', () => {
      player1.hand = [
        card2,
        card4
      ]
      state.emissionsLine = [
        card1,
        card3
      ]
      let result = GameState.playCard(state, player1.socketID, card2.id, 2).clientEvents

      let expected = {...state}
      expected = GameState.createClientEvent(expected, "card_played_from_hand", {
        socketID: 1, cardID: card2.id, position: 2
      })
      expected = GameState.setPlayerTurn(expected, player2.socketID)
      assert.deepEqual(result, expected.clientEvents)
    })

    it('plays card to specified position', () => {
      player1.hand = [
        card1,
        card2,
        card3,
        card4
      ]
      let result = GameState.playCard(state, player1.socketID, card1.id, 0)
      result.playerTurn = player1.socketID
      result = GameState.playCard(result, player1.socketID, card4.id, 2)
      result.playerTurn = player1.socketID
      result = GameState.playCard(result, player1.socketID, card2.id, 2)
      assert.deepEqual(result.emissionsLine, [card1, card2, card4])
      assert.deepEqual(result.player1, {...state.player1, hand: [card3]})
    })

    describe('placement incorrect', () => {
      beforeEach(() => {
        player1.hand = [
          card1,
          card4
        ]
        state.emissionsLine = [
          card2,
          card3
        ]
        state.deck = [card5]
      })

      it('does not play card if card to the left is higher', () => {
        let result = GameState.playCard(state, player1.socketID, card1.id, 2)
        assert.deepEqual(result.emissionsLine, [card2, card3])
      })

      it('does not play card if card to the right is lower', () => {
        let result = GameState.playCard(state, player1.socketID, card4.id, 2)
        assert.deepEqual(result.emissionsLine, [card2, card3])
      })

      it('gives player new card and notifies players of incorrect placement', () => {
        let result = GameState.playCard(state, player1.socketID, card1.id, 2)
        let expected = {...state};
        player1.hand = [card4]
        expected = GameState.drawCard(expected, player1.socketID)
        expected = GameState.createClientEvent(expected, "incorrect_card_placement", {
          cardID: card1.id,
          socketID: player1.socketID
        })
        assert.deepEqual(result.player1, expected.player1)
        assert.deepEqual(result.clientEvents, expected.clientEvents)
      })

      it('puts card at bottom of deck', () => {
        let result = GameState.playCard(state, player1.socketID, card1.id, 2)

        assert.deepEqual(result.deck, [card1])
      })
    })
  })

  describe('fromEvents', () => {
    let deck: Card[] = createDeck()
    const nextCard = (_deck: Card[] = deck) => {
      const card = _deck.pop()
      if (!card) throw new Error("Deck ran out of cards")
      return card
    }
    beforeEach(() => {
      deck = createDeck()
    })

    it('ignores third player', () => {
      const events: GameEvent[] = [
        createServerEvent("game_started", { seed: 'some-seed', deck: deck }),
        createServerEvent("player_connected", { socketID: playerID }),
        createServerEvent("player_connected", { socketID: opponentID })
      ]

      const state = GameState.fromEvents(events)

      events.push(createServerEvent("player_connected", { socketID: 3 }))

      const state2 = GameState.fromEvents(events)

      assert.deepEqual(state2, state)
    })

    it("ends game on disconnect", () => {
      const events: GameEvent[] = [
        createServerEvent("game_started", { seed: 'some-seed', deck: deck }),
        createServerEvent('player_connected', { socketID: playerID }),
        createServerEvent('player_connected', { socketID: opponentID }),
        createServerEvent('player_disconnected', { socketID: opponentID })
      ]

      const clientEvents = GameState.fromEvents(events).clientEvents

      assert.deepEqual(
        clientEvents[clientEvents.length - 1],
        new GameEvent(17, "opponent_disconnected")
      )
    })
  })
})
