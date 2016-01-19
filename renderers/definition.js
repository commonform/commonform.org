module.exports = definition

var h = require('virtual-dom/h')

function definition(term) {
  var description = ( 'Definition of ' + term )
  return h('dfn', { id: description, title: description }, term) }
