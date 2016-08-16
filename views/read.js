var assert = require('assert')
var editor = require('./editor')
var loading = require('./loading')

module.exports = function read (digest, state, send) {
  assert(typeof digest === 'string')
  assert(typeof state === 'object')
  assert(typeof send === 'function')
  var haveData = state.merkle && state.merkle.digest === digest
  if (!haveData) {
    return loading(state.mode, function () {
      send('form:fetch', {digest: digest})
    })
  } else {
    return editor(state, send)
  }
}
