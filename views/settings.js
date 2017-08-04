var annotators = require('../annotators')
var assert = require('assert')
var find = require('array-find')
var numberings = require('../numberings')

module.exports = function settings (state, send) {
  assert(typeof state === 'object')
  assert(typeof send === 'function')
  var flags = state.annotators

  var section = document.createElement('section')
  section.className = 'settings'

  var first = document.createElement('p')
  first.appendChild(annotatorCheckBoxes(flags, send))
  section.appendChild(first)

  var second = document.createElement('p')
  second.appendChild(numbering(state.numbering, send))
  section.appendChild(second)

  var third = document.createElement('p')
  third.appendChild(document.createTextNode('Document: '))
  third.appendChild(toggle(
    'Form Hash in Header',
    'form:prependHash',
    state.prependHash,
    send
  ))
  third.appendChild(toggle(
    'Mark Filled Blanks',
    'form:markFilled',
    state.markFilled,
    send
  ))
  section.appendChild(third)

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

function numbering (selected, send) {
  assert(typeof selected === 'string')
  var form = document.createElement('form')
  form.onchange = function (event) {
    event.stopPropagation()
    send('form:numbering', event.target.value)
  }

  form.appendChild(document.createTextNode('Word File Numbering:'))

  var select = document.createElement('select')
  numberings.forEach(function (numbering) {
    var option = document.createElement('option')
    if (selected === numbering.name) {
      option.setAttribute('selected', 'true')
    }
    option.value = numbering.name
    option.appendChild(document.createTextNode(numbering.summary))
    select.appendChild(option)
  })
  form.appendChild(select)

  return form
}

function toggle (labelText, action, enabled, send) {
  var label = document.createElement('label')

  var input = document.createElement('input')
  input.setAttribute('type', 'checkbox')
  if (enabled) {
    input.setAttribute('checked', 'true')
  }
  input.onchange = function (event) {
    send(action, event.target.checked)
  }
  label.appendChild(input)

  label.appendChild(document.createTextNode(labelText))

  return label
}
