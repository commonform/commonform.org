module.exports = renderers

var classnames = require('classnames')
var h = require('virtual-dom/h')
var renderDiff = require('./diff')
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
    var diffing = !!state.comparing
    var blanks = state.blanks
    var derived = state.derived
    var selection = state.selection
    var emit = state.emit
    var focused = state.focused
    var fromAPI = state.fromAPI
    var mobile = state.mobile
    var projects = state.projects
    var signatures = state.signatures
    var digest = derived.merkle.digest
    var comparingDigest = state.comparingDigest
    var diff = state.derived.diff
    var menu = thunk(
      renderMenu,
      { digest: digest,
        emit: emit,
        selection: selection,
        mobile: mobile,
        form: form,
        fromAPI: fromAPI,
        blanks: blanks,
        sigantures: signatures })
    return h('article',
      { className: classnames('commonform', { diff: diffing }) },
      [ menu,
        h('form',
          { onsubmit: function(event) {
              event.preventDefault() } },
          [ thunk(renderHeader, {
              digest: digest,
              comparingDigest: comparingDigest,
              projects: projects }),
            ( diffing
                ? renderDiff({ diff: diff })
                : renderForm({
                    blanks: blanks,
                    selection: selection,
                    focused: focused,
                    form: form,
                    derived: derived,
                    emit: emit,
                    path: [ ] }) ) ]),
        thunk(renderSignaturePages,
          { emit: emit,
            signatures: signatures }),
        menu,
        thunk(renderFooter) ]) } }
