var h = require('virtual-dom/h')

function reference(state) {
  var heading = state.data.reference
  return h('a.reference',
    { href: '/#' + state.digest + '/heading/' + heading },
    heading) }

module.exports = reference
