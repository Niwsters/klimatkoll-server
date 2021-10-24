import 'mocha'
import assert from 'assert'
import { State } from './game.service'
import { Card } from './cards'
import { GameState, GameEvent, Player } from './game'
import { SocketResponse } from './socket'
import { Factory } from './test-factory'

describe('GameServiceState', () => {
  let state: State
  let deck: Card[]
  let responses: SocketResponse[]
  beforeEach(() => {
    deck = Factory.Deck.get()
    state = new State(deck)
  })

  describe('constructor', () => {
    it('sets properties', () => {
      state = new State(deck)
      assert.deepEqual(state, {
        deck: deck,
        games: []
      })
    })
  })

  describe('new', () => {
    it('returns new instance of itself', () => {
      const newState = state.new()
      assert.deepEqual(newState, state)
    })

    it('keeps the type and access to methods', () => {
      const newState = state.new()
      const newerState = newState.new()
      assert.deepEqual(newerState, state)
    })

    it('assigns given properties', () => {
      const newState = state.new({ a: 'b' })
      assert.deepEqual(newState, {...state, a: 'b'})
    })
  })

  describe('getGame', () => {
    it('returns game containing player with given socketID', () => {
      const game = Factory.GameState.createdBy(1).get()
      state.games = [
        Factory.GameState.createdBy(3).get(),
        game
      ]
      const result = state.getGame({ socketID: 1 })
      assert.deepEqual(result, game)
    })

    it('returns game with given roomID', () => {
      const game = Factory.GameState.roomID('blargh').get()
      state.games = [
        Factory.GameState.roomID('honk').get(),
        game
      ]
      const result = state.getGame({ roomID: 'blargh' })
      assert.deepEqual(result, game)
    })
  })

  describe('create_game', () => {
    it('creates new GameState for given socket ID', () => {
      let responses: SocketResponse[]
      let responses2: SocketResponse[]
      const gs1 = Factory.GameState.createdBy(3).roomID('blargh').seed('some-seed').get();
      const gs2 = Factory.GameState.createdBy(4).roomID('honk').seed('other-seed').get();
      [state, responses] = state.create_game({ socketID: 3, roomID: 'blargh' }, 'some-seed');
      [state, responses2] = state.create_game({ socketID: 4, roomID: 'honk' }, 'other-seed');
      assert.deepEqual(state.games, [gs1, gs2])

      assert.deepEqual(
        responses,
        gs1
          .clientEvents
          .map((event: GameEvent) => {
            return {
              ...event,
              socketID: 3
            }
          })
      )
    })

    // TODO: If game already exists
  })

  describe('join_game', () => {
    it('calls playerConnected on existing game', () => {
      const gs: GameState = Factory.GameState.createdBy(3).roomID('blargh').get();
      state.games = [gs]
      const payload = { socketID: 4, roomID: 'blargh' }
      const expected = GameState.playerConnected(gs, payload)
      let responses: SocketResponse[]
      [state, responses] = state.join_game(payload);

      assert.deepEqual(expected, state.games[0])

      const expectedResponses = [
        ...expected
          .clientEvents
          .map((event: GameEvent) => {
            return {
              ...event,
              socketID: 3
            }
          }),
        ...expected
          .clientEvents
          .map((event: GameEvent) => {
            return {
              ...event,
              socketID: 4
            }
          }),
      ]

      assert.deepEqual(
        responses,
        expectedResponses
      )
    })

    // TODO: If game doesn't exist
  })

  describe('getMethod', () => {
    it('returns existing method on object', () => {
      assert.deepEqual(state.getMethod('join_game'), state.join_game)
    })

    it('does nothing on nonexisting method', () => {
      const [newState, responses] = state.getMethod('nonexistant_method')({})
      assert.deepEqual(state, newState)
      assert.deepEqual(responses, [])
    })
  })
})
