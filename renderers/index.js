var blankInputs = require('./blank-inputs')
var footer = require('./footer')
var form = require('./form')
var h = require('virtual-dom/h')
var mainMenu = require('./main-menu')
var persistedProperties = require('../utility/persisted-properties.json')
var pick = require('object-pick')

function browser(state) {
  var analysis = state.derived.analysis
  var emit = state.emit
  var blanks = state.blanks
  state.root = true
  return h('article.commonform', [
    mainMenu(pick(state, persistedProperties)),
    blankInputs({
      analysis: analysis.blanks,
      emit: emit,
      values: blanks }),
    form({
      data: state.data,
      emit: state.emit,
      forcused: state.focused,
      path: state.path,
      derived: {
        annotations: state.derived.annotations,
        merkle: state.derived.merkle } }),
    footer() ]) }

module.exports = browser
