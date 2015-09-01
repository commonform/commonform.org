var h = require('virtual-dom/h')
var scrollTo = require('../scroll-to')

function use(state) {
  var term = state.data.use
  return h('a.use',
    { href: '#',
      onclick: function(event) {
        event.preventDefault()
        event.stopPropagation()
        scrollTo('definition', term) } },
    term) }

module.exports = use
