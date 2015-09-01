var h = require('virtual-dom/h')
var scrollTo = require('../scroll-to')

function reference(state) {
  var heading = state.data.reference
  return h('a.reference',
    { href: '#',
      onclick: function(event) {
        event.preventDefault()
        event.stopPropagation()
        scrollTo('heading', heading) } },
    heading) }

module.exports = reference
