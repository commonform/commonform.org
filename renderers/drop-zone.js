module.exports = dropZone

var deepEqual = require('deep-equal')
var h = require('virtual-dom/h')

var OVER_CLASS = 'over'

function dropZone(state) {
  var emit = state.emit
  var path = state.path
  var focused = state.focused
  var properties = { className: 'dropZone', href: '#' }
  if (focused !== null) {
    var withinFocused = deepEqual(focused, path.slice(0, focused.length))
    var same = deepEqual(focused, path)
    var immediatelyAfter = deepEqual(
      focused.slice(0, -1).concat(focused[focused.length - 1] + 1),
      path)
    var canDropHere = ( !withinFocused && !immediatelyAfter )
    if (canDropHere) {
      properties.className += ' active'
      properties.onmouseover = over
      properties.onmouseleave = leave
      properties.title = 'Move here.'
      properties.onclick = function(event) {
        event.preventDefault()
        this.classList.remove(OVER_CLASS)
        emit('move', focused, path) } }
    if (immediatelyAfter || same) {
      properties.className += ' notFocused' } }
  return h('a', properties) }

function over(event) {
  event.preventDefault()
  this.classList.add(OVER_CLASS) }

function leave(event) {
  event.preventDefault()
  this.classList.remove(OVER_CLASS) }
