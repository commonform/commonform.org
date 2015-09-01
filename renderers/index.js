var blanks = require('./blanks')
var footer = require('./footer')
var form = require('./form')
var h = require('virtual-dom/h')
// var headingsTree = require('../headings-tree')
var mainMenu = require('./main-menu')
// var toc = require('./table-of-contents')

function browser(state) {
  state.root = true
  return h('article.commonform', [
    mainMenu(state),
    blanks({
      digest: state.digest,
      values: state.blanks,
      emit: state.emit,
      analysis: state.analysis.blanks }),
    // toc(headingsTree(state.merkle, state.data)),
    form(state),
    footer() ]) }

module.exports = browser
