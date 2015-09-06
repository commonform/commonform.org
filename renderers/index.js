var blankInputs = require('./blank-inputs')
var footer = require('./footer')
var form = require('./form')
var h = require('virtual-dom/h')
var mainMenu = require('./main-menu')

function browser(state) {
  var analysis = state.derived.analysis
  var emit = state.emit
  var blanks = state.blanks
  var data = state.data
  var title = state.title
  state.root = true
  return h('article.commonform', [
    mainMenu({
      blanks: blanks,
      data: data,
      emit: emit,
      title: title }),
    blankInputs({
      analysis: analysis.blanks,
      emit: emit,
      values: blanks }),
    form({
      data: state.data,
      emit: state.emit,
      focused: state.focused,
      path: state.path,
      derived: {
        annotations: state.derived.annotations,
        merkle: state.derived.merkle } }),
    footer() ]) }

module.exports = browser
