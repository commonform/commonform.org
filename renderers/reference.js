var h = require('virtual-dom/h')

function reference(state) {
  return h('span.reference', state.data.reference) }

module.exports = reference
