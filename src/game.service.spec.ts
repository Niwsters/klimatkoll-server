import 'mocha'
import { expect } from 'chai'
import assert from 'assert'
import { GameService, State } from './game.service'
import { Card } from './cards'
import { GameState, GameEvent, Player } from './game'
import { SocketEvent, SocketResponse } from './socket'
import { Factory } from './test-factory'

describe('GameService', () => {
  let service: GameService
  beforeEach(() => {
    const deck: Card[] = []
    service = new GameService(deck)
  })

  describe('newSeed', () => {
    it('returns randomised string', () => {
      const seed1 = service.newSeed()
      const seed2 = service.newSeed()
      assert.equal(seed1.length, 10)
      assert.notEqual(seed2, seed1)
    })
  })

  describe('handleEvent', () => {
    it('calls relevant event method and pushes responses to event stream', () => {
      let calledWith: any[] = [];
      (service.state as any).blargh = (...args: any[]) => {
        calledWith = args
        return [{}, []]
      }
      service.handleEvent(new SocketEvent('blargh', { lolpan: '1337' }))

      assert.deepEqual(calledWith, [{ lolpan: '1337' }]);
    })

    it('pushes responses to event stream', () => {
      const response: SocketResponse = { socketID: 3, event_id: 2, event_type: 'test', payload: {} };
      const responsesSent: any[] = []
      service.responses$.subscribe(res => responsesSent.push(res))

      let calledWith: any[] = [];
      (service.state as any).blargh = (...args: any[]) => {
        calledWith = args
        return [{}, [response, response]]
      }
      service.handleEvent(new SocketEvent('blargh', { lolpan: '1337' }))

      assert.deepEqual(calledWith, [{ lolpan: '1337' }]);
      assert.deepEqual(responsesSent, [response, response]);
    })
  })
})

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

  describe('create_game', () => {
    it('creates new GameState for given socket ID', () => {
      let responses: SocketResponse[]
      let responses2: SocketResponse[]
      const gs1 = Factory.GameState.get({ createdBy: 3, roomID: 'blargh', seed: 'some-seed' });
      const gs2 = Factory.GameState.get({ createdBy: 4, roomID: 'honk', seed: 'other-seed' });
      [state, responses] = state.create_game({ socketID: 3, roomID: 'blargh' }, 'some-seed');
      [state, responses2] = state.create_game({ socketID: 4, roomID: 'honk' }, 'other-seed');
      expect(state.games).to.deep.equal([gs1, gs2])

      const expected = gs1
        .clientEvents
        .map((event: GameEvent) => {
          return {
            ...event,
            socketID: 3
          }
        })

      expect(responses).to.deep.equal(expected)
    })

    it('throws error if payload is invalid', () => {
      assert.throws(() => state.create_game({ roomID: 'blargh' }, 'some-seed'))
      assert.throws(() => state.create_game({ socketID: 3 }, 'some-seed'))
    })

    // TODO: If game already exists
  })

  describe('join_game', () => {
    it('calls playerConnected on existing game', () => {
      const gs: GameState = Factory.GameState.get({ createdBy: 3, roomID: 'blargh' });
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

    it("throws error if game doesn't exist", () => {
      state.games = [ Factory.GameState.get({ roomID: 'blargh' }) ];
      assert.throws(() => state.join_game({ socketID: 4, roomID: 'honk' }))
    })

    it("throws error if gamestate.playerConnected results in player2 being undefined", () => {
      const gamestate: GameState = Factory.GameState.createdBy(3).roomID('blargh').get();
      state.games = [gamestate]

      const oldPlayerConnected = GameState.playerConnected;
      GameState.playerConnected = () => { return gamestate }

      assert.throws(() => state.join_game({ socketID: 4, roomID: 'blargh' }), new Error("gamestate.player2 is undefined"))

      GameState.playerConnected = oldPlayerConnected;
    })
  })

  describe('disconnected', () => {
    it("deletes existing game that player was connected to", () => {
      let gamestate: GameState = Factory.GameState.get({
        createdBy: 3,
        joinedBy: 4,
        roomID: "a"
      })

      let gamestate2: GameState = Factory.GameState.get({ roomID: "b" })

      state.games = [
        gamestate,
        gamestate2
      ]

      expect(state.disconnected({ socketID: 4 })[0].games).to.deep.equal([gamestate2])
    })
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
