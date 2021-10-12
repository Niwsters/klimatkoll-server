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
    deck = Factory.Deck()
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

  describe('getGame', () => {
    it('returns game containing player with given socketID', () => {
      const game = {
        ...Factory.GameState(),
        player1: new Player(1)
      }
      state.games = [
        Factory.GameState(),
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
      [state, responses] = State.createGame(state, 3, 'some-seed', 'blargh');
      [state, responses2] = State.createGame(state, 4, 'other-seed', 'honk');
      assert.deepEqual(state.games, [
        Factory.GameState(),
        new GameState('honk', 'other-seed', deck, 4)
      ])

      assert.deepEqual(
        responses,
        Factory.GameState()
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
