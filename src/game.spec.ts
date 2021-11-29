import 'mocha'
import assert from 'assert'
import { GameState, GameEvent, Player } from './game'
import { Card, CardData } from './cards'
import cards from './cards-sv'
import seedrandom = require('seedrandom');
import { Factory } from './test-factory'

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

describe('GameState', () => {
  let deck: Card[] = createDeck()
  let lastEventID = 0
  let state: GameState
  const playerID = 0
  const opponentID = 1

  beforeEach(() => {
    lastEventID = 0
    deck = createDeck()
    state = Factory.GameState.get()
  })

  describe('constructor', () => {
    it('creates gamestate with given seed, deck, and player', () => {
      const state = new GameState("blargh", 'some-seed', deck, 3)
      assert.deepEqual(state, {
        roomID: "blargh",
        deck: GameState.shuffle(deck, 'some-seed'),
        player1: new Player(3),
        clientEvents: [
          new GameEvent(0, 'room_joined', { roomID: "blargh" }),
          new GameEvent(1, 'waiting_for_players')
        ],
        emissionsLine: []
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

  describe('createClientEvent', () => {
    it('creates client event with given type and payload', () => {
      const result = GameState.createClientEvent(state, "blargh", { honk: "1337" })
      assert.deepEqual(result, {
        ...state, 
        clientEvents: [
          ...state.clientEvents,
          new GameEvent(state.clientEvents.length, "blargh", { honk: "1337"})
        ]
      })
    })

    it('assigns rising event IDs', () => {
      state = GameState.createClientEvent(state, "blargh", { honk: "1337" })
      const result = GameState.createClientEvent(state, "blargh", { honk: "1337" })
      assert.deepEqual(result, {
        ...state,
        clientEvents: [
          ...state.clientEvents,
          new GameEvent(state.clientEvents.length, "blargh", { honk: "1337" })
        ]
      })
    })
  })

  describe('getPlayer', () => {
    it('returns player with given socket ID', () => {
      state.player1 = new Player(1)
      state.player2 = new Player(2)

      assert.deepEqual(GameState.getPlayer(state, 1), state.player1)
      assert.deepEqual(GameState.getPlayer(state, 2), state.player2)
    })

    it("throws error if player doesn't exist", () => {
      state.player1 = new Player(1)
      state.player2 = new Player(2)

      assert.throws(() => GameState.getPlayer(state, 3), new Error("No player with socketID: " + 3))
    })
  })

  describe('getOpponent', () => {
    it('returns the socketID of the other player', () => {
      state.player1 = new Player(1)
      state.player2 = new Player(2)
      assert.deepEqual(GameState.getOpponent(state, 1), state.player2)
      assert.deepEqual(GameState.getOpponent(state, 2), state.player1)
    })

    it('throws error if either player is undefined', () => {
      state.player1 = new Player(1)
      assert.throws(() => GameState.getOpponent(state, 1), new Error("Both players must be defined to return an opponent"))
    })
  })

  describe('setPlayerTurn', () => {
    let player1: Player
    let player2: Player
    beforeEach(() => {
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

    it("throws error if player 2 is undefined", () => {
      state.player2 = undefined;
      assert.throws(() => GameState.setPlayerTurn(state, player1.socketID), new Error("Player 2 is undefined"))
    })
  })

  describe('playerConnected', () => {
    /*
    it('assigns player1 if no player is connected', () => {
      const state = Factory.GameState.get()
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
    */

    it('assigns player2 if player1 already connected, and starts game', () => {
      const state: GameState = {
        ...Factory.GameState.get(),
        player1: new Player(2)
      }
      let result = GameState.playerConnected(state, { socketID: 3 })

      let expected = {...state}
      expected.player2 = {
        socketID: 3,
        hand: []
      }
      const player1 = new Player(2)
      const player2 = new Player(3)
      expected = GameState.createClientEvent(expected, "room_joined", { roomID: "blargh" })
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
      let state = GameState.playerConnected(Factory.GameState.get(), { socketID: 498 })
      const result = GameState.playerConnected(state, { socketID: 198 })
      assert.deepEqual(result, state)
    })
  })

  describe('drawCard', () => {
    it('draws card for player1', () => {
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
        new GameEvent(state.clientEvents.length, "draw_card", {
          card: card, socketID: state.player1.socketID
        }),
        new GameEvent(state.clientEvents.length+1, "next_card", {
          card: state.deck[state.deck.length - 2]
        })
      ])
    })

    it('draws card for player2', () => {
      state.deck = createDeck()
      state.player2 = new Player(4)
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

    it("throws error if trying to draw for a player not in the game", () => {
      state.player1 = new Player(1)
      state.player2 = new Player(2)
      assert.throws(() => GameState.drawCard(state, 3), new Error("Player not in game with socketID: " + 3))
    })

    it("throws error if deck runs out of cards", () => {
      state.deck = []
      state.player1 = new Player(1)
      assert.throws(() => GameState.drawCard(state, state.player1.socketID), new Error("Deck ran out of cards"))
    })
  })

  describe('playCardFromDeck', () => {
    it('plays card from top of deck to emissions line and notifies client', () => {
      const state = Factory.GameState.get()

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
          ...state.clientEvents,
          new GameEvent(state.clientEvents.length, "card_played_from_deck", {
            card: card3, position: 0
          }),
          new GameEvent(state.clientEvents.length+1, "next_card", {
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
      state = Factory.GameState.get() 
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

    it("throws error if player 2 is undefined", () => {
      state.player2 = undefined
      assert.throws(() => GameState.playCard(state, player1.socketID, card1.id, 0), new Error("Can't play card: player 2 is undefined"))
    })

    it("throws error if player doesn't have card", () => {
      player1.hand = [card1]
      player2.hand = [card2]
      assert.throws(() => GameState.playCard(state, player1.socketID, card2.id, 0),
        new Error("Player 1 does not have card with ID: " + card2.id))
      state.playerTurn = player2.socketID
      assert.throws(() => GameState.playCard(state, player2.socketID, card1.id, 0),
        new Error("Player 2 does not have card with ID: " + card1.id))
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

  describe('playerDisconnected', () => {
    it('should notify other player', () => {
      let state = Factory.GameState.get()
      let result = GameState.playerDisconnected(state, {})
      assert.deepEqual(
        result.clientEvents[result.clientEvents.length-1],
        new GameEvent(2, "opponent_disconnected"))
    })
  })

  describe('handleEvent', () => {
    let state: GameState
    beforeEach(() => {
      state = Factory.GameState.get()
    })

    it('handles player_connected events', () => {
      let payload = { socketID: 3 }
      let result = GameState.handleEvent(state,
        new GameEvent(0, "player_connected", payload))

      assert.deepEqual(result, GameState.playerConnected(state, payload))
    })

    it('handles player_disconnected events', () => {
      const result = GameState.handleEvent(state, new GameEvent(0, "player_disconnected"))
      assert.deepEqual(result, GameState.playerDisconnected(state, {}))
    })

    it('handles card_played_from_hand events', () => {
      state.player2 = new Player(1337)
      const payload = {
        socketID: 5,
        cardID: 3,
        position: 0
      }
      const result = GameState.handleEvent(state,
        new GameEvent(0, "card_played_from_hand", payload))
      assert.deepEqual(result, GameState.playCard(
        state,
        payload.socketID,
        payload.cardID,
        payload.position))
    })
  })
})
