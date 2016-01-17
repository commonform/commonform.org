module.exports = definition

var h = require('virtual-dom/h')

function definition(state) {
  var term = state.data.definition
  return h('dfn', { id: ( 'Definition of ' + term ) }, term) }
