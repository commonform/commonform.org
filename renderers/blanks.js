var h = require('virtual-dom/h')
var blankEntryRow = require('./blank-entry-row')
var titleInput = require('./title-input')
var pick = require('object-pick')

function blanks(state) {
  return h('div.blanks',
    h('table',
      [ h('thead',
          [ h('th', 'Blank'),
            h('th', 'Value') ]),
        h('tbody',
          [ h('tr',
            [ h('th', 'Document Title'),
              titleInput(pick(state, [ 'title', 'emit' ])) ]),
            Object.keys(state.analysis)
              .sort()
              .map(function(blank) {
                return blankEntryRow({
                  digest: state.digest,
                  blank: blank,
                  emit: state.emit,
                  values: state.values }) }) ]) ])) }

module.exports = blanks
