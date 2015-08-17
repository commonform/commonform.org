var h = require('virtual-dom/h')
var input = require('./blank-input')

function blankEntry(state) {
  var blank = state.blank
  var values = state.values
  return h('tr.blank',
    [ h('th.name', blank),
      h('td.value', input(state)) ]) }

module.exports = blankEntry
