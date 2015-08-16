var h = require('virtual-dom/h')

function definition(state) {
  return h('span.definition', state.data.definition) }

module.exports = definition
