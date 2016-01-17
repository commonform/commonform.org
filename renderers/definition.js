module.exports = definition

var h = require('virtual-dom/h')

function definition(state) {
  var term = state.data.definition
  var description = ( 'Definition of ' + term )
  return h('dfn', { id: description, title: description }, term) }
