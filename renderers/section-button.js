module.exports = sectionButton

var h = require('virtual-dom/h')

function sectionButton(state) {
  var editing = state.editing
  var path = state.path
  var toggleFocus = state.toggleFocus
  var properties = {
    title: 'Click to Focus',
    onclick: toggleFocus }
  if (editing) {
    properties.attributes = { draggable: 'true' }
    properties.ondragend = function(event) {
      event.dataTransfer.clearData() }
    properties.ondragstart = function(event) {
       event.dataTransfer.dropEffect = 'move'
       event.dataTransfer.setData('json', JSON.stringify(path)) } }
  return h('a.sigil', properties, '§') }
