var blankInputs = require('./blank-inputs')
var footer = require('./footer')
var form = require('./form')
var h = require('virtual-dom/h')
var mainMenu = require('./main-menu')

function browser(state) {
  var analysis = state.derived.analysis
  var annotations = state.derived.annotations
  var blanks = state.blanks
  var data = state.data
  var emit = state.emit
  var focused = state.focused
  var merkle = state.derived.merkle
  var path = state.path
  var title = state.title
  state.root = true
  return h('article.commonform', [
    mainMenu({
      blanks: blanks,
      data: data,
      digest: merkle.digest,
      emit: emit,
      title: title }),
    blankInputs({
      analysis: analysis.blanks,
      emit: emit,
      values: blanks }),
    form({
      data: data,
      emit: emit,
      focused: focused,
      path: path,
      derived: {
        annotations: annotations,
        merkle: merkle } }),
    footer() ]) }

module.exports = browser
