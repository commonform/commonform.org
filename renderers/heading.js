var h = require('virtual-dom/h')
var nameID = require('../name-id')

function heading(state) {
  var text = state.data
  var name = (
    state.depth <= 5 ?
      ( 'h' + ( state.depth + 1) ) :
      ( 'span.h' + ( state.depth + 1 ) ) )
  return h(
    name,
    { id: nameID(state.digest, 'heading', text) },
    text) }

module.exports = heading
