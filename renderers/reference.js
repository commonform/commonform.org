var h = require('virtual-dom/h')

function reference(state) {
  return h('a.reference',
    { href: '#heading:' + state.data.reference },
    state.data.reference) }

module.exports = reference
