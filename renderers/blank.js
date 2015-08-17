var h = require('virtual-dom/h')

function blank(state) {
  return h('span.blank', state.data.blank) }

module.exports = blank
