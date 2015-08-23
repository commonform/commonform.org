var h = require('virtual-dom/h')

function blank(state) {
  var blank = state.data.blank
  return h('a.blank',
    { href: '/#' + state.digest + '/blank/' + blank },
    blank) }

module.exports = blank
