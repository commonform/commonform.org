var h = require('virtual-dom/h')

function use(state) {
  var term = state.data.use
  return h('a.use',
    { href: '/#' + state.digest + '/definition/' + term },
    term) }

module.exports = use
