module.exports = renderers

var h = require('virtual-dom/h')
var renderDownloadButton = require('./download-button')
var renderEMailButton = require('./e-mail-button')
var renderFooter = require('./footer')
var renderHeader = require('./header')
var renderForm = require('./form')
var thunk = require('vdom-thunk')

function renderers(state) {
  var form = state.form
  if (!form) {
    return h('div') }
  else {
    var annotations = state.derived.annotations
    var blanks = state.blanks
    var emit = state.emit
    var focused = state.focused
    var merkle = state.derived.merkle
    var path = state.path
    var digest = state.derived.merkle.digest
    return h('article.commonform',
      [ h('div.menu',
          [ renderDownloadButton(state),
            thunk(renderEMailButton, digest) ]),
        h('form',
          { onsubmit: function(event) {
              event.preventDefault() } },
          [ thunk(renderHeader, digest),
            renderForm({
              blanks: blanks,
              focused: focused,
              form: form,
              derived: {
                annotations: annotations,
                merkle: merkle },
              emit: emit,
              path: path }) ]),
        thunk(renderFooter) ]) } }
