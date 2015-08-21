var h = require('virtual-dom/h')

function blank(state) {
  var blank = state.data.blank
  return h('a.blank', { href: '/#blank:' + blank }, blank) }

module.exports = blank
