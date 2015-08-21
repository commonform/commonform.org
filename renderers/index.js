var blanks = require('./blanks')
var errorHeader = require('./error-header')
var form = require('./form')
var h = require('virtual-dom/h')
var mainMenu = require('./main-menu')
var pick = require('object-pick')
var titleInput = require('./title-input')

function browser(state) {
  return h('div.browser', [
    titleInput(pick(state, [ 'title', 'emit' ])),
    mainMenu(state),
    blanks({
      values: state.blanks,
      emit: state.emit,
      analysis: state.analysis.blanks }),
    errorHeader(state.errors),
    form(state) ]) }

module.exports = browser
