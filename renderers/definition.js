var h = require('virtual-dom/h')

function definition(state) {
  var term = state.data.definition
  return h('a.definition',
    { id: state.digest + '/definition/' + term },
    term) }

module.exports = definition
