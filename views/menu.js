const html = require('choo/html')
const clone = require('../utilities/clone')
const outline = require('outline-numbering')
const querystring = require('querystring')
const docx = require('commonform-docx')
const toMarkup = require('commonform-markup-stringify')
const parseMarkup = require('commonform-markup-parse')
const filesaver = require('filesaver.js').saveAs
const signaturePagesToOOXML = require('ooxml-signature-pages')

module.exports = function (form, send) {
  return html`
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
      var options = {title: title, numbering: outline}
      if (form.signatures) {
        options.after = signaturePagesToOOXML(form.signatures)
      }
      filesaver(
        docx(clone(form.tree), form.blanks, options).generate({type: 'blob'}),
        fileName(title, 'docx'))
    }
  }

  function downloadMarkup (event) {
    event.preventDefault()
    var title = window.prompt('Enter a document title', 'Untitled Form')
    if (title !== null) {
      var blob = new Blob(
        [toMarkup(form.tree)],
        {type: 'text/plain;charset=utf-8'}
      )
      filesaver(blob, fileName(title, 'cform'))
    }
  }

  function selectFile (event) {
    event.preventDefault()
    const target = event.target
    const file = target.files[0]
    const reader = new FileReader()
    const isJSON = file.type.match(/application\/json/)
    reader.onload = function (event) {
      const result = event.target.result
      var tree
      try {
        tree = isJSON ? JSON.parse(result) : parseMarkup(result).form
      } catch (error) { return }
      send('form:content', {tree: tree.form})
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
  const date = new Date().toISOString()
  return '' + title + ' ' + date + '.' + extension
}
