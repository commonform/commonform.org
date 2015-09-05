var blankInput = require('./blank-input')
var h = require('virtual-dom/h')
var pathID = require('../path-id')

function blankEntry(state) {
  var blank = state.blank
  return h('tr.blank',
    { attributes: { 'data-blank': blank } },
    [ h('th.name', blank),
      h('td.value', blankInput(state)),
      h('td',
        state.insertions
          .map(function(insertion) {
            return h('a',
              { href: ( '#path:' + pathID(insertion) ) },
              'Here') })) ]) }

module.exports = blankEntry
