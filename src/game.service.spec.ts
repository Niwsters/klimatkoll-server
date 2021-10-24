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
      const game = {
        ...Factory.GameState.get(),
        player1: new Player(1)
      }
      state.games = [
        Factory.GameState.get(),
        game
      ]
      const result = State.getGame(state, 1)
      assert.deepEqual(result, game)
    })
  })

  describe('createGame', () => {
    it('creates new GameState for given socket ID', () => {
      let responses: SocketResponse[]
      let responses2: SocketResponse[]
      const gs1 = Factory.GameState.createdBy(3).roomID('blargh').seed('some-seed').get();
      const gs2 = Factory.GameState.createdBy(4).roomID('honk').seed('other-seed').get();
      [state, responses] = state.createGame({ socketID: 3, roomID: 'blargh' }, 'some-seed');
      [state, responses2] = state.createGame({ socketID: 4, roomID: 'honk' }, 'other-seed');
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
  })
})
