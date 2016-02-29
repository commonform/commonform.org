module.exports = renderers

var h = require('virtual-dom/h')
var renderFooter = require('./footer')
var renderForm = require('./form')
var renderHeader = require('./header')
var renderMenu = require('./menu')
var renderSignaturePages = require('./signature-pages')
var thunk = require('vdom-thunk')

function renderers(state) {
  var form = state.form
  if (!form) {
    return h('div') }
  else {
    var blanks = state.blanks
    var derived = state.derived
    var emit = state.emit
    var focused = state.focused
    var fromAPI = state.fromAPI
    var mobile = state.mobile
    var projects = state.projects
    var signatures = state.signatures
    var digest = derived.merkle.digest
    var menu = thunk(
      renderMenu,
      { digest: digest,
        emit: emit,
        mobile: mobile,
        form: form,
        fromAPI: fromAPI,
        blanks: blanks,
        sigantures: signatures })
    return h('article.commonform',
      [ menu,
        h('form',
          { onsubmit: function(event) {
              event.preventDefault() } },
          [ thunk(renderHeader, {
              digest: digest,
              projects: projects }),
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
        menu,
        thunk(renderFooter) ]) } }
