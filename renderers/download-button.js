module.exports = downloadButton

var clone = require('../utility/json-clone')
var docx = require('commonform-docx')
var filesaver = require('filesaver.js').saveAs
var h = require('virtual-dom/h')
var outline = require('outline-numbering')

function downloadButton(state) {
  var form = state.form
  var blanks = state.blanks
  return h('button',
    { onclick: function(event) {
        event.preventDefault()
        var title = prompt(
          'Enter a document title',
          'Untitled Form')
        if (title !== null) {
          filesaver(
            docx(
              clone(form), blanks,
              { title: title, numbering: outline })
              .generate({ type: 'blob' }),
            fileName(title, 'docx')) } } },
    [ 'Download' ]) }

function fileName(title, extension) {
  var date = new Date().toISOString()
  return ( '' + title + ' ' + date + '.' + extension ) }
