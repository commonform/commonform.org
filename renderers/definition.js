var h = require('virtual-dom/h')

function definition(state) {
  var term = state.data.definition
  return h('a.definition', { id: 'definition:' + term }, term) }

module.exports = definition
