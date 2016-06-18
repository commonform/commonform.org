module.exports = menu

var h = require('virtual-dom/h')
var renderEditButton = require('./edit-button')
var renderDOCXButton = require('./docx-button')
var renderEMailButton = require('./e-mail-button')
var renderLoadButton = require('./load-button')
var renderMarkupButton = require('./markup-button')
var renderShareButton = require('./share-button')
var thunk = require('vdom-thunk')

function menu(state) {
  var blanks = state.blanks
  var digest = state.digest
  var editing = state.editing
  var emit = state.emit
  var form = state.form
  var fromAPI = state.fromAPI
  var mobile = state.mobile
  var signatures = state.signatures
  return h('div.menu',
    [ renderEditButton({ editing: editing, emit: emit }),
      ( mobile ? undefined :
          renderDOCXButton(
            { form: form,
              blanks: blanks,
              signatures: signatures }) ),
      ( mobile ? undefined :
          renderMarkupButton({ form: form }) ),
      thunk(renderEMailButton, digest),
      ( fromAPI ? undefined :
          renderShareButton({ form: form, emit: emit }) ),
      renderLoadButton({ emit: emit }) ]) }
