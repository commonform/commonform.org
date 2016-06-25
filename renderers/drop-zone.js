module.exports = dropZone

var deepEqual = require('deep-equal')
var h = require('virtual-dom/h')

var OVER_CLASS = 'over'

function dropZone(state) {
  var emit = state.emit
  var path = state.path
  var selection = state.selection
  var properties = { className: 'dropZone', href: '#' }
  if (selection) {
    var withinSelection = deepEqual(selection, path.slice(0, selection.length))
    var immediatelyAfter = deepEqual(
      selection.slice(0, -1).concat(selection[selection.length - 1] + 1),
      path)
    var canDropHere = ( !withinSelection && !immediatelyAfter )
    if (canDropHere) {
      properties.className += ' active'
      properties.onmouseover = over
      properties.onmouseleave = leave
      properties.title = 'Move here.'
      properties.onclick = function(event) {
        event.preventDefault()
        this.classList.remove(OVER_CLASS)
        emit('move', selection, path) } } }
  return h('a', properties) }

function over(event) {
  event.preventDefault()
  this.classList.add(OVER_CLASS) }

function leave(event) {
  event.preventDefault()
  this.classList.remove(OVER_CLASS) }
