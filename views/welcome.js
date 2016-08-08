var assert = require('assert')
var editor = require('./editor')

module.exports = function (state, send) {
  assert.equal(typeof state, 'object')
  assert.equal(typeof send, 'function')
  return editor(state, send)
}
