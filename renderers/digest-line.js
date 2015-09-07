var h = require('virtual-dom/h')

function digestLine(state) {
  var digest = state.digest
  return h('div',
    [ h('span.digest',
        [ digest.slice(0, 16),
          h('wbr'),
          digest.slice(16, 32),
          h('wbr'),
          digest.slice(32, 48),
          h('wbr'),
          digest.slice(48) ]) ]) }

module.exports = digestLine
