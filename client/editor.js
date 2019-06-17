/* eslint-env browser */
var classnames = require('classnames')
var commonmark = require('commonform-commonmark')
var critique = require('commonform-critique')
var lint = require('commonform-lint')

var dirty = false

window.addEventListener('beforeunload', function (event) {
  if (dirty) event.returnValue = 'If you leave this page without saving, your work will be lost.'
})

document.addEventListener('DOMContentLoaded', function () {
  parseAndAnnotateOnEdit()
  setDirtyFlagOnEdit()
})

// Parse and lint the form on every change.
function parseAndAnnotateOnEdit () {
  var editor = document.getElementById('editor')

  // Insert a readout element for displaying lint annotations.
  var readout = document.createElement('ul')
  editor.parentNode.insertBefore(readout, editor.nextSibling)

  // Whenever the user makes a change, parse the markup
  // and display lint annotations.
  editor.addEventListener('input', function () {
    // Parse.
    try {
      var parsed = commonmark.parse(editor.value)
    } catch (error) {
      return invalid('Invalid Markup')
    }
    var form = parsed.form
    emptyReadout()

    // Lint.
    var foundError = false
    lint(form).forEach(function (annotation) {
      if (annotation.level === 'error') foundError = true
      append(annotation.message)
    })
    editor.className = classnames('editor', { warn: foundError })

    // Critique.
    critique(form).forEach(function (annotation) {
      append(annotation.message)
    })
  })

  function append (message) {
    var li = document.createElement('li')
    li.appendChild(document.createTextNode(message))
    readout.appendChild(li)
  }

  function emptyReadout () {
    readout.innerHTML = ''
  }

  function invalid (message) {
    editor.className = classnames('editor', 'error')
    emptyReadout()
    append(message)
  }
}

// If the user changes the content in the editor, mark it
// dirty, so we can warn on `beforeunload`.
function setDirtyFlagOnEdit () {
  var editors = [ 'editor', 'notes', 'signaturePages' ]
  editors.forEach(function (id) {
    var editor = document.getElementById(id)
    editor.addEventListener('input', function () { dirty = true })
  })
}
