var h = require('virtual-dom/h')

function blankEntry(state) {
  var blank = state.blank
  var values = state.values
  return h('tr.blank',
    [ h('th.name', blank),
      h('td.value', (
        blank in values ?
          values[blank] :
          '(None)' )) ]) }

module.exports = blankEntry
