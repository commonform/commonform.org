var h = require('virtual-dom/h')
var scrollTo = require('../scroll-to')

function blank(state) {
  var blank = state.data.blank
  return h('a.blank',
    { href: '#',
      attributes: { 'data-insert': blank },
      onclick: function(event) {
        event.preventDefault()
        scrollTo('blank', blank) } },
    blank) }

module.exports = blank
