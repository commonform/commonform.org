var annotators = require('../annotators')
var assert = require('assert')
var find = require('array-find')

module.exports = function settings (state, send) {
  assert(typeof state === 'object')
  assert(typeof send === 'function')
  var flags = state.annotators

  var section = document.createElement('section')
  section.className = 'settings'

  var first = document.createElement('p')
  first.appendChild(annotatorCheckBoxes(flags, send))
  section.appendChild(first)

  return section
}

function annotatorCheckBoxes (flags, send) {
  var form = document.createElement('form')
  form.onchange = function (event) {
    event.stopPropagation()
    var target = event.target
    send('form:toggle annotator', {
      annotator: target.value,
      enabled: target.checked
    })
  }
  form.appendChild(document.createTextNode('Annotate:'))
  Object.keys(flags).forEach(function (name) {
    form.appendChild(checkBox(
      find(annotators, function (annotator) {
        return annotator.name === name
      }),
      flags[name],
      send
    ))
  })
  return form
}

function checkBox (annotator, enabled, send) {
  var label = document.createElement('label')

  var input = document.createElement('input')
  input.setAttribute('type', 'checkbox')
  if (enabled) {
    input.setAttribute('checked', 'true')
  }
  input.value = annotator.name
  label.appendChild(input)

  label.appendChild(document.createTextNode(annotator.summary))

  return label
}
