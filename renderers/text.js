var h = require('virtual-dom/h')

function text(state) {
  return h('span', state.data) }

module.exports = text
