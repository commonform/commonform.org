var blanks = require('./blanks')
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
    form(state) ]) }

module.exports = browser
