/* eslint-env browser */
var dirty = false

window.addEventListener('beforeunload', function (event) {
  if (dirty) event.returnValue = 'If you leave this page without saving, your work will be lost.'
})

document.addEventListener('DOMContentLoaded', function () {
  setDirtyFlagOnEdit()
})

// If the user changes the content in the editor, mark it
// dirty, so we can warn on `beforeunload`.
function setDirtyFlagOnEdit () {
  var editors = [ 'editor', 'notes', 'signaturePages' ]
  editors.forEach(function (id) {
    var editor = document.getElementById(id)
    editor.addEventListener('input', function () { dirty = true })
  })
}
