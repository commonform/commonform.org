module.exports = renderers

var downloadButton = require('./download-button')
var eMailButton = require('./e-mail-button')
var footer = require('./footer')
var form = require('./form')
var h = require('virtual-dom/h')
var header = require('./header')

function renderers(state) {
  var data = state.data
  if (!data) {
    return h('p', 'Loading ...') }
  else {
    var blanks = state.blanks
    var emit = state.emit
    var merkle = state.derived.merkle
    var path = state.path
    return h('article.commonform', [
      h('div.menu',
        [ downloadButton(state),
          eMailButton(state) ]),
      h('form',
        { onsubmit: function(event) {
            event.preventDefault() } },
        [ header({ digest: state.derived.merkle.digest }),
          form({
            blanks: blanks,
            data: data,
            derived: { merkle: merkle },
            emit: emit,
            path: path }) ]),
      footer() ]) } }
