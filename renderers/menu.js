module.exports = menu

var h = require('virtual-dom/h')
var renderDownloadButton = require('./download-button')
var renderEMailButton = require('./e-mail-button')
var thunk = require('vdom-thunk')

function menu(state) {
  var digest = state.digest
  var mobile = state.mobile
  return h('div.menu',
    [ ( mobile ? undefined : renderDownloadButton(state) ),
    thunk(renderEMailButton, digest) ]) }
