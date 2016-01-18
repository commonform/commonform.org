module.exports = renderers

var h = require('virtual-dom/h')
var renderDownloadButton = require('./download-button')
var renderEMailButton = require('./e-mail-button')
var renderFooter = require('./footer')
var renderHeader = require('./header')
var renderRenderForm = require('./form')

function renderers(state) {
  var form = state.form
  if (!form) {
    return h('div') }
  else {
    var blanks = state.blanks
    var emit = state.emit
    var focused = state.focused
    var merkle = state.derived.merkle
    var path = state.path
    return h('article.commonform',
      [ h('div.menu',
          [ renderDownloadButton(state),
            renderEMailButton(state) ]),
        h('form',
          { onsubmit: function(event) {
              event.preventDefault() } },
          [ renderHeader({ digest: state.derived.merkle.digest }),
            renderRenderForm({
              blanks: blanks,
              focused: focused,
              form: form,
              derived: { merkle: merkle },
              emit: emit,
              path: path }) ]),
        renderFooter() ]) } }
