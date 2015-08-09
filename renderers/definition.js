var h = require('virtual-dom/h')

function definition(state) {
  return h('span.definition', state.definition) }

module.exports = definition
