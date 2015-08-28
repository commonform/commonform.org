var blankInput = require('./blank-input')
var h = require('virtual-dom/h')
var nameID = require('../name-id')
var pathID = require('../path-id')

function blankEntry(state) {
  var blank = state.blank
  var digest = state.digest
  var values = state.values
  return h('tr.blank',
    { id: nameID(state.digest, 'blank', blank) },
    [ h('th.name', blank),
      h('td.value', blankInput(state)),
      h('td',
        state.analysis
          .map(function(path) {
            return h('a',
              { href: '/#' + pathID(digest, path.slice(0, -2)) },
              'Here') })) ]) }

module.exports = blankEntry
