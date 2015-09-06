var blankInputs = require('./blank-inputs')
var footer = require('./footer')
var form = require('./form')
var h = require('virtual-dom/h')
var mainMenu = require('./main-menu')
var omit = require('object-omit')
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
    form(omit(state, 'title')),
    footer() ]) }

module.exports = browser
