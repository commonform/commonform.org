var h = require('virtual-dom/h')
var blankEntryRow = require('./blank-entry-row')

function blanks(state) {
  return h('div.blanks', 
    h('table.blanks',
      [ h('thead', [
          h('th', 'Blank'),
          h('th', 'Value') ]),
        h('tbody',
         Object.keys(state.analysis)
           .map(function(blank) {
             return blankEntryRow({
               blank: blank,
               update: state.update,
               values: state.values }) })) ])) }

module.exports = blanks
