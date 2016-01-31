module.exports = loadButton

var h = require('virtual-dom/h')
var parseMarkup = require('commonform-markup-parse')

function loadButton(state) {
  var emit = state.emit
  // Overlay an invisible file input over a button that we can style.
  // See http://www.quirksmode.org/dom/inputfile.html
  return h(
    'form.fileInputTrick',
    [ h('button', 'Load a File'),
      h('input',
        { type: 'file',
          accept: '.cform,.commonform,.json',
          onchange: function(event) {
            event.preventDefault()
            var target = event.target
            var file = target.files[0]
            var reader = new FileReader()
            var isJSON = file.type.match(/application\/json/)
            reader.onload = function(event) {
              var result = event.target.result
              var form
              try {
                form = (
                  isJSON ?
                    JSON.parse(result) :
                    parseMarkup(result).form ) }
              catch(error) {
                return }
              emit('form', form, false) }
            reader.readAsText(file, 'UTF-8')
            target.value = null } },
        'Load a Form') ]) }
