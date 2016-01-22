module.exports = signaturePages

var clone = require('../utility/json-clone')
var emptySignaturePage = require('../empty-signature-page')
var h = require('virtual-dom/h')
var renderSignaturePage = require('./signature-page')
var thunk = require('vdom-thunk')

function signaturePages(state) {
  var signatures = state.signatures
  var emit = state.emit
  if (signatures.length === 0) {
    return h('button',
      { onclick: function(event) {
          event.preventDefault()
          emit('signatures',
            'set', [ ],
            [ clone(emptySignaturePage),
              clone(emptySignaturePage) ]) } },
      'Add Signature Pages') }
  else {
    return h('.signaturePages',
      [ h('p.endOfPage',
          ( signatures.length === 1 ?
              '[Signature Page Follows]' :
              '[Signature Pages Follow]' )),
        signatures.map(function(page, index) {
          return thunk(
            renderSignaturePage,
            { emit: emit,
              page: page,
              path: [ index ] }) }) ]) } }
