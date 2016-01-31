module.exports = menu

var h = require('virtual-dom/h')
var renderDOCXButton = require('./docx-button')
var renderEMailButton = require('./e-mail-button')
var renderMarkupButton = require('./markup-button')
var thunk = require('vdom-thunk')

function menu(state) {
  var blanks = state.blanks
  var digest = state.digest
  var form = state.form
  var mobile = state.mobile
  var signatures = state.signatures
  return h('div.menu',
    [ ( mobile ? undefined :
          renderDOCXButton(
            { form: form,
              blanks: blanks,
              signatures: signatures }) ),
      ( mobile ? undefined :
          renderMarkupButton({ form: form }) ),
      thunk(renderEMailButton, digest) ]) }
