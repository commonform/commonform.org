module.exports = menu

var h = require('virtual-dom/h')
var renderDOCXButton = require('./docx-button')
var renderEMailButton = require('./e-mail-button')
var thunk = require('vdom-thunk')

function menu(state) {
  var digest = state.digest
  var mobile = state.mobile
  return h('div.menu',
    [ ( mobile ? undefined : renderDOCXButton(state) ),
    thunk(renderEMailButton, digest) ]) }
