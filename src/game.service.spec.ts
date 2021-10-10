import 'mocha'
import assert from 'assert'
import { State } from './game.service'

describe('GameServiceState', () => {
  let state: GameState
  beforeEach(() => {
    state = new GameState()
  })

  describe('createGame', () => {
    it('creates new GameState for given socket ID', () => {
      state = State.createGame(state, 3)
    })
  })
})
