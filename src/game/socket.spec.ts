import 'mocha'
import assert from 'assert'
import { expect } from 'chai'
import { Socket, SocketEvent } from './socket'
import { Subject } from 'rxjs'

const data = { blargh: "honk" }

describe('SocketEvent', () => {
  describe('constructor', () => {
    it('sets properties', () => {
      const payload = { blargh: 'honk' }
      const event = new SocketEvent('blargh', 2, payload)
      expect(event.event_type).to.equal('blargh')
      expect(event.socketID).to.equal(2)
      expect(event.payload).to.equal(payload)
    })

    it('assigns empty payload by default', () => {
      const event = new SocketEvent('blargh', 0)
      assert.deepEqual(event.payload, {})
    })
  })

  describe('type', () => {
    it('returns event.event_type', () => {
      const event = new SocketEvent('blargh', 0, {})
      assert.equal(event.type, 'blargh')
    })
  })
})

describe('Socket', () => {
  let socket: Socket
  let connection: any
  beforeEach(() => {
    connection = { send: () => {}, on: () => {} }
    socket = new Socket(connection, 'blargh')
  })

  describe('constructor', () => {
    it('sets properties', () => {
      assert.deepEqual(socket.events$, new Subject<SocketEvent>())
    })
  })

  describe('sendEvent', () => {
    let eventDataReceived: string
    beforeEach(() => {
      socket.connection.send = (eventData: string) => {
        eventDataReceived = eventData
      }
    })

    it("calls connection.send with event data", () => {
      const event = new SocketEvent('blargh', 0, { test: '1337' })
      socket.sendEvent(event.type, event.payload)
      assert.equal(eventDataReceived, JSON.stringify({
        type: event.type,
        payload: event.payload
      }))
    })

    it("sets payload to {} by default", () => {
      socket.sendEvent('blargh')      
      assert.equal(eventDataReceived, JSON.stringify({ type: 'blargh', payload: {} }))
    })
  })

  describe('isProtocolAllowed', () => {
    it('returns true if protocol is sv or en', () => {
      assert.equal(Socket.isProtocolAllowed(['sv'], 'sv'), true)
      assert.equal(Socket.isProtocolAllowed(['sv', 'en'], 'en'), true)
      assert.equal(Socket.isProtocolAllowed(['honk'], 'blargh'), false)
    })
  })

  describe('parseMessage', () => {
    it('parses binary data', () => {
      const msg = {
        type: 'binary',
        binaryData: JSON.stringify(data)
      }

      assert.deepEqual(Socket.parseMessage(msg), data)
    })

    it('parses utf8 data', () => {
      const msg = {
        type: 'utf8',
        utf8Data: JSON.stringify(data)
      }

      assert.deepEqual(Socket.parseMessage(msg), data)
    })

    it('throws error on unknown data type', () => {
      const msg = {
        type: 'aaaaa',
        binaryData: JSON.stringify(data)
      }

      assert.throws(() => Socket.parseMessage(msg))
    })
  })
})
