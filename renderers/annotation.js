var h = require('virtual-dom/h')

function annotation(state) {
  return h('div.annotation', state.data.message) }

module.exports = annotation
