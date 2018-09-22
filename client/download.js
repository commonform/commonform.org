var docx = require('commonform-docx')
var filesaver = require('filesaver.js').saveAs
var outline = require('outline-numbering')

document.addEventListener('DOMContentLoaded', function () {
  enableBlankInputs()
  overrideButtonClickHandler()
})

function overrideButtonClickHandler () {
  var buttons = document.getElementsByClassName('docx')
  for (var index = 0; index < buttons.length; index++) {
    var button = buttons[index]
    button.removeAttribute('href')
    button.addEventListener('click', function (event) {
      event.preventDefault()
      event.stopPropagation()
      var options = {
        numbering: outline,
        markFilled: true,
        indentMargins: true,
        centerTitle: true
      }
      var publication = window.publication
      var title
      if (publication) {
        options.edition = publication.edition
        if (publication.title) {
          title = publication.title
          options.title = title
        } else {
          title = [
            publication.publisher, publication.project, publication.edition
          ].join(' ')
          options.title = publication.publisher + ' ' + publication.project
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
      filesaver(
        docx(window.loaded.form, blanks, options).generate({type: 'blob'}),
        title + '.docx',
        true
      )
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
