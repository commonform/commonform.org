var blanks = require('./blanks')
var form = require('./form')
var h = require('virtual-dom/h')

function browser(state) {
  return h('div.browser', [
    blanks({
      values: state.blanks,
      analysis: state.analysis.blanks }),
    form(state) ]) }

module.exports = browser
