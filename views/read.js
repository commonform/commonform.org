var assert = require('assert')
var editor = require('./editor')
var loading = require('./loading')
var error = require('./error')

module.exports = function read (digest, state, send) {
  assert(typeof digest === 'string')
  assert(typeof state === 'object')
  assert(typeof send === 'function')
  var haveData = state.merkle && state.merkle.digest === digest
  if (state.error) {
    return error(state.error)
  } else {
    if (!haveData) {
      return loading(state.mode, function () {
        send('form:fetch', {digest: digest})
      })
    } else {
      return editor(state, send)
    }
  }
}
