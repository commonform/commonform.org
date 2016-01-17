module.exports = text

var h = require('virtual-dom/h')

function text(state) {
  return h('span', state.data) }
