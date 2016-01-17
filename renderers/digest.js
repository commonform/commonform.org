module.exports = digest

var h = require('virtual-dom/h')

function digest(state) {
  var digest = state.digest
  return h('span.digest',
    [ digest.slice(0, 16),
      h('wbr'),
      digest.slice(16, 32),
      h('wbr'),
      digest.slice(32, 48),
      h('wbr'),
      digest.slice(48) ]) }
