import 'mocha'
import assert from 'assert'
import { Socket, SocketEvent } from './socket'
import { Subject } from 'rxjs'

const data = { blargh: "honk" }

describe('SocketEvent', () => {
  describe('constructor', () => {
    it('sets properties', () => {
      const payload = { blargh: 'honk' }
      const event = new SocketEvent('blargh', payload)
      assert.equal(event.event_type, 'blargh')
      assert.deepEqual(event.payload, payload)
    })

    it('assigns empty payload by default', () => {
      const event = new SocketEvent('blargh')
      assert.deepEqual(event.payload, {})
    })
  })

  describe('type', () => {
    it('returns event.event_type', () => {
      const event = new SocketEvent('blargh', {})
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

    it("subscribes to connection.on and forwards to receiveEvent", () => {
      const resultEvents: SocketEvent[] = []
      let callbacks: any = {}
      connection.on = (msgType: string, callback: any) => callbacks[msgType] = callback;
      const socket = new Socket(connection, 'blargh')
      socket.events$.subscribe(e => resultEvents.push(e))
      callbacks.close('blargh')
      assert.deepEqual(resultEvents[0], new SocketEvent('disconnected', { socketID: 2 }))
      callbacks.message({
        type: 'utf8',
        utf8Data: JSON.stringify({ event_type: 'blargh' })
      })
      assert.deepEqual(resultEvents[1], new SocketEvent('blargh', { socketID: 2 }))
    })
  })

  describe('receiveEvent', () => {
    it("attaches socketID to event", () => {
      const eventsSent: any[] = [];
      const event = new SocketEvent('blargh', {})
      socket.socketID = 3
      socket.events$.subscribe(e => eventsSent.push(e))
      socket.receiveEvent(event)
      assert.deepEqual(eventsSent, [
        {
          ...event,
          payload: {
            socketID: 3
          }
        }
      ])
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
      const event = new SocketEvent('blargh', { test: '1337' })
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
      assert.equal(Socket.isProtocolAllowed('sv'), true)
      assert.equal(Socket.isProtocolAllowed('en'), true)
      assert.equal(Socket.isProtocolAllowed('blargh'), false)
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
