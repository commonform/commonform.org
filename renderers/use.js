var h = require('virtual-dom/h')

function use(state) {
  var term = state.data.use
  return h('a.use',
    { title: ( 'Jump to definition of "' + term + '"' ),
      href: ( '#definition:' + term ) },
    term) }

module.exports = use
