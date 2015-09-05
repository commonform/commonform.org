var h = require('virtual-dom/h')
var pathID = require('../path-id')

function blank(state) {
  var blank = state.data.blank
  return h('a.blank',
    { id: ( 'path:' + pathID(state.path) ),
      href: ( '#blank:' + blank ) },
    blank) }

module.exports = blank
