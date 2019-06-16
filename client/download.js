/* eslint-env browser */
var DOCX_OPTIONS = require('../docx-options')
var docx = require('commonform-docx')
var commonmark = require('commonform-commonmark')
var filesaver = require('filesaver.js').saveAs
var signaturePagesToOOXML = require('ooxml-signature-pages')

document.addEventListener('DOMContentLoaded', function () {
  enableBlankInputs()
  overrideButtonClickHandlers('docx')
  overrideButtonClickHandlers('markdown')
})

function overrideButtonClickHandlers (className) {
  var buttons = document.getElementsByClassName(className)
  for (var index = 0; index < buttons.length; index++) {
    var button = buttons[index]
    button.removeAttribute('href')
    button.addEventListener('click', function (event) {
      event.preventDefault()
      event.stopPropagation()
      var options
      if (className === 'markdown') {
        options = {}
      } else {
        options = Object.assign({}, DOCX_OPTIONS)
      }
      var publication = window.publication
      var title
      if (publication) {
        options.edition = publication.edition
        if (publication.title) {
          title = publication.title + ' ' + publication.edition
          options.title = title
        } else {
          title = [
            publication.publisher, publication.project, publication.edition
          ].join(' ')
          options.title = publication.publisher + ' ' + publication.project
        }
        if (publication.signaturePages) {
          options.after = signaturePagesToOOXML(publication.signaturePages)
        }
      } else title = window.tree.digest
      var blanks = []
      var blankInputs = document.getElementsByClassName('blank')
      for (var index = 0; index < blankInputs.length; index++) {
        var input = blankInputs[index]
        if (!input.value) break
        blanks.push({
          blank: JSON.parse(input.dataset.path),
          value: input.value
        })
      }
      if (className === 'markdown') {
        var blob = new Blob(
          [commonmark.stringify(window.loaded.form, blanks, options)],
          { type: 'text/plain;charset=utf-8' }
        )
        filesaver(blob, title + '.md', true)
      } else {
        docx(window.loaded.form, blanks, options)
          .generateAsync({ type: 'blob' })
          .then(function (blob) {
            filesaver(blob, title + '.docx', true)
          })
      }
      return false
    })
  }
}

function enableBlankInputs () {
  var blanks = document.getElementsByClassName('blank')
  for (var index = 0; index < blanks.length; index++) {
    var blank = blanks[index]
    blank.disabled = false
  }
}
