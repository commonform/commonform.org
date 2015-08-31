var h = require('virtual-dom/h')

function heading(state) {
  var text = state.data
  var name = (
    state.depth <= 5 ?
      ( 'h' + ( state.depth + 1) ) :
      ( 'span.h' + ( state.depth + 1 ) ) )
  return h(
    name,
    { attributes: { 'data-heading': text } },
    text) }

module.exports = heading
