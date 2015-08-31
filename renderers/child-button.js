var h = require('virtual-dom/h')
var deepEqual = require('deep-equal')

function childButton(state) {
  return h('a.childButton', '§') }

module.exports = childButton
