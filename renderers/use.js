var h = require('virtual-dom/h')

function use(state) {
  var term = state.data.use
  return h('a.use',
    { href: ( '#definition:' + term ) },
    term) }

module.exports = use
