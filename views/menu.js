var choo = require('choo')
var clone = require('../clone')
var outline = require('outline-numbering')
var querystring = require('querystring')
var docx = require('commonform-docx')
var toMarkup = require('commonform-markup-stringify')
var parseMarkup = require('commonform-markup-parse')
var filesaver = require('filesaver.js').saveAs
var signaturePagesToOOXML = require('ooxml-signature-pages')

module.exports = function (form, send) {
  return choo.view`
    <div class="menu">
      <button onclick=${downloadDOCX}>Download for Word</button>
      <button onclick=${downloadMarkup}>Download Markup</button>
      <button onclick=${email}>E-Mail</button>
      <form class=fileInputTrick>
        <button>Open File</button>
        <input type=file accept=".cform,.commonform,.json" onchange=${selectFile}>
      </form>
    </div>
  `

  function downloadDOCX (event) {
    event.preventDefault()
    var title = window.prompt('Enter a document title', 'Untitled Form')
    if (title !== null) {
      var options = { title: title, numbering: outline }
      if (form.signatures) {
        options.after = signaturePagesToOOXML(form.signatures)
      }
      filesaver(
        docx(clone(form.tree), form.blanks, options).generate({ type: 'blob' }),
        fileName(title, 'docx'))
    }
  }

  function downloadMarkup (event) {
    event.preventDefault()
    var title = window.prompt('Enter a document title', 'Untitled Form')
    if (title !== null) {
      var blob = new Blob(
        [ toMarkup(form.tree) ],
        { type: 'text/plain;charset=utf-8' }
      )
      filesaver(blob, fileName(title, 'cform'))
    }
  }

  function selectFile (event) {
    event.preventDefault()
    var target = event.target
    var file = target.files[0]
    var reader = new FileReader()
    var isJSON = file.type.match(/application\/json/)
    reader.onload = function (event) {
      var result = event.target.result
      var tree
      try {
        tree = isJSON ? JSON.parse(result) : parseMarkup(result).form
      } catch (error) { return }
      send('form:content', { tree: tree.form })
    }
    reader.readAsText(file, 'UTF-8')
    target.value = null
  }

  function email (event) {
    event.preventDefault()
    window.location.href = 'mailto:?' + querystring.stringify({
      subject: 'Link to Common Form',
      body: 'https://commonform.org/forms/' + form.merkle.digest
    })
  }
}

function fileName (title, extension) {
  var date = new Date().toISOString()
  return '' + title + ' ' + date + '.' + extension
}
