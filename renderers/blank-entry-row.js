var blankInput = require('./blank-input')
var h = require('virtual-dom/h')
var scrollTo = require('../scroll-to')

function blankEntry(state) {
  var blank = state.blank
  return h('tr.blank',
    { attributes: { 'data-blank': blank } },
    [ h('th.name', blank),
      h('td.value', blankInput(state)),
      h('td',
        Array.apply(0, Array(state.insertions))
          .map(function(_, index) {
            return h('a',
              { href: '#',
                onclick: function(event) {
                  event.preventDefault()
                  event.stopPropagation()
                  scrollTo('insert', blank, index) } },
              'Here') })) ]) }

module.exports = blankEntry
