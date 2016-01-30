module.exports = docxButton

var clone = require('../utility/json-clone')
var docx = require('commonform-docx')
var filesaver = require('filesaver.js').saveAs
var h = require('virtual-dom/h')
var outline = require('outline-numbering')
var signaturePages = require('ooxml-signature-pages')

function docxButton(state) {
  var form = state.form
  var blanks = state.blanks
  var signatures = state.signatures
  return h('button',
    { onclick: function(event) {
        event.preventDefault()
        var title = prompt(
          'Enter a document title',
          'Untitled Form')
        if (title !== null) {
          var options = {
            title: title,
            numbering: outline }
          if (signatures) {
            options.after = signaturePages(signatures) }
          filesaver(
            docx(clone(form), blanks, options)
              .generate({ type: 'blob' }),
            fileName(title, 'docx')) } } },
    [ 'Download for Word' ]) }

function fileName(title, extension) {
  var date = new Date().toISOString()
  return ( '' + title + ' ' + date + '.' + extension ) }
