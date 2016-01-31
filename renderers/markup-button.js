module.exports = markupButton

var filesaver = require('filesaver.js').saveAs
var h = require('virtual-dom/h')
var stringify = require('commonform-markup-stringify')

function markupButton(state) {
  console.log('state', state)
  var form = state.form
  return h('button',
    { onclick: function(event) {
        event.preventDefault()
        var title = prompt(
          'Enter a document title',
          'Untitled Form')
        if (title !== null) {
          console.log(form)
          console.log(stringify(form))
          var blob = new Blob(
            [ stringify(form) ],
            { type: 'text/plain;charset=utf-8' })
          filesaver(
            blob,
            fileName(title, 'cform')) } } },
    [ 'Download Markup' ]) }

function fileName(title, extension) {
  var date = new Date().toISOString()
  return ( '' + title + ' ' + date + '.' + extension ) }
