var docx = require('commonform-docx')
var fileName = require('../file-name')
var filesaver = require('filesaver.js').saveAs
var h = require('virtual-dom/h')

function saveDOCXButton(state) {
  return h('button.saveDOCX',
    { href: '/#',
      onclick: function(event) {
        event.preventDefault()
        var title = state.title
        var form = state.data
        var blanks = state.blanks
        var zip = docx(form, blanks, { title: title })
        var date = new Date().toISOString()
        filesaver(
          zip.generate({ type: 'blob' }),
          fileName(title, 'docx')) } },
    'Save DOCX') }

module.exports = saveDOCXButton
