var h = require('virtual-dom/h')

function definition(state) {
  var term = state.data.definition
  return h('dfn.definition',
    { id: ( 'definition:' + term ),
      attributes: { 'data-definition': term } },
    term) }

module.exports = definition
