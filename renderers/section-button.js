module.exports = sectionButton

var h = require('virtual-dom/h')

function sectionButton(state) {
  var toggleFocus = state.toggleFocus
  var properties = { title: 'Click to Focus', onclick: toggleFocus }
  return h('a.sigil', properties, '§') }
