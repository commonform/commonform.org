module.exports = renderers

var h = require('virtual-dom/h')
var renderDownloadButton = require('./download-button')
var renderEMailButton = require('./e-mail-button')
var renderFooter = require('./footer')
var renderHeader = require('./header')
var renderForm = require('./form')
var renderSignaturePages = require('./signature-pages')
var thunk = require('vdom-thunk')

function renderers(state) {
  var form = state.form
  if (!form) {
    return h('div') }
  else {
    var blanks = state.blanks
    var derived = state.derived
    var digest = derived.merkle.digest
    var emit = state.emit
    var focused = state.focused
    var mobile = state.mobile
    var signatures = state.signatures
    return h('article.commonform',
      [ h('div.menu',
          [ ( mobile ? undefined : renderDownloadButton(state) ),
            thunk(renderEMailButton, digest) ]),
        h('form',
          { onsubmit: function(event) {
              event.preventDefault() } },
          [ thunk(renderHeader, digest),
            renderForm({
              blanks: blanks,
              focused: focused,
              form: form,
              derived: derived,
              emit: emit,
              path: [ ] }) ]),
        thunk(renderSignaturePages,
          { emit: emit,
            signatures: signatures }),
        thunk(renderFooter) ]) } }
