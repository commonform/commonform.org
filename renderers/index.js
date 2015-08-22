var blanks = require('./blanks')
var errorHeader = require('./error-header')
var form = require('./form')
var h = require('virtual-dom/h')
var mainMenu = require('./main-menu')
var pick = require('object-pick')
var searchBox = require('./search-box')
var titleInput = require('./title-input')

function browser(state) {
  return h('div.browser', [
    searchBox(state.emit),
    titleInput(pick(state, [ 'title', 'emit' ])),
    mainMenu(state),
    blanks({
      digest: state.digest,
      values: state.blanks,
      emit: state.emit,
      analysis: state.analysis.blanks }),
    errorHeader(state.digest, state.errors),
    form(state) ]) }

module.exports = browser
