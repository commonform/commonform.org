module.exports = sectionButton

var h = require('virtual-dom/h')

function sectionButton(state) {
  var selection = state.selection
  var toggleFocus = state.toggleFocus
  var properties = { title: 'Click to Focus' }
  if (!selection) { properties.onclick = toggleFocus }
  return h('a.sigil', properties, '§') }
