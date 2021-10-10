import 'mocha'
import assert from 'assert'
import { Socket } from './socket'

const data = { blargh: "honk" }

describe('Socket', () => {
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
