var blanks = require('./blanks')
var form = require('./form')
var mainMenu = require('./main-menu')
var h = require('virtual-dom/h')

function browser(state) {
  return h('div.browser', [
    mainMenu(state),
    blanks({
      values: state.blanks,
      update: state.update,
      analysis: state.analysis.blanks }),
    form(state) ]) }

module.exports = browser
