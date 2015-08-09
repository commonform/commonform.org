var h = require('virtual-dom/h')

function use(state) {
  return h('span.use', state.use) }

module.exports = use
