var h = require('virtual-dom/h')
var blankEntry = require('./blank-entry')
var titleEntry = require('./title-entry')
var pick = require('object-pick')

function blankInputs(state) {
  return h('div.blanks',
   [ titleEntry(pick(state, [ 'emit', 'title' ])),
      Object.keys(state.analysis)
        .sort()
        .map(function(blank) {
          return blankEntry({
            blank: blank,
            emit: state.emit,
            insertions: state.analysis[blank],
            values: state.values }) }) ]) }

module.exports = blankInputs
