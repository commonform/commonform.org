var h = require('virtual-dom/h')

function heading(state) {
  return h('div.heading', state.data) }

module.exports = heading
