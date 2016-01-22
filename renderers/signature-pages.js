module.exports = signaturePages

var clone = require('../utility/json-clone')
var emptySignaturePage = require('../empty-signature-page')
var h = require('virtual-dom/h')
var renderSignaturePage = require('./signature-page')
var thunk = require('vdom-thunk')

function signaturePages(state) {
  var emit = state.emit
  var signatures = state.signatures
  if (signatures.length === 0) {
    return h('button',
      { onclick: function(event) {
          event.preventDefault()
          var twoBlankPages =
            [ clone(emptySignaturePage),
              clone(emptySignaturePage) ]
          emit('signatures', 'set', [ ], twoBlankPages) } },
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
