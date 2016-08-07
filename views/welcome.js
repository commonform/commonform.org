var editor = require('./editor')

module.exports = function (state, prev, send) {
  return editor(state, send)
}
