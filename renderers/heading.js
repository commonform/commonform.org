var h = require('virtual-dom/h')

function heading(state) {
  return h('span.heading', state.data) }

module.exports = heading
