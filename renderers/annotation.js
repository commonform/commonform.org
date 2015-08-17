var h = require('virtual-dom/h')

function annotation(state) {
  var data = state.data
  return h('div.annotation', [
    ( data.url ?
      h('a', { href: data.url }, data.message) :
      data.message ),
    ' (' + data.source + ')' ]) }

module.exports = annotation
