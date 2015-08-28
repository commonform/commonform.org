var blanks = require('./blanks')
var errorHeader = require('./error-header')
var footer = require('./footer')
var form = require('./form')
var h = require('virtual-dom/h')
var mainMenu = require('./main-menu')
var pick = require('object-pick')
var titleInput = require('./title-input')

function browser(state) {
  return h('div.browser', [
    mainMenu(state),
    blanks({
      digest: state.digest,
      values: state.blanks,
      emit: state.emit,
      analysis: state.analysis.blanks }),
    errorHeader(state.digest, state.errors),
    form(state),
    footer() ]) }

module.exports = browser
