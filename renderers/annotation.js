var h = require('virtual-dom/h')

function annotation(state) {
  var data = state.data
  return h(( 'p.' + data.level ), [
    ( data.url ?
      h('a', { href: data.url }, data.message) :
      data.message ) ]) }

module.exports = annotation
