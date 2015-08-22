var h = require('virtual-dom/h')
var blankInput = require('./blank-input')
var nameID = require('../name-id')

function blankEntry(state) {
  var blank = state.blank
  var values = state.values
  return h('tr.blank',
    { id: nameID(state.digest, 'blank', blank) },
    [ h('th.name', blank),
      h('td.value', blankInput(state)) ]) }

module.exports = blankEntry
