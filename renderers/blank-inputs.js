var h = require('virtual-dom/h')
var blankEntry = require('./blank-entry')
var titleEntry = require('./title-entry')

function blankInputs(state) {
  var analysis = state.analysis
  var emit = state.emit
  var title = state.title
  var values = state.values
  return h('div.blanks',
   [ titleEntry({ emit: emit, title: title }),
      Object.keys(state.analysis)
        .sort()
        .map(function(blank) {
          return blankEntry({
            blank: blank,
            emit: emit,
            insertions: analysis[blank],
            values: values }) }) ]) }

module.exports = blankInputs
