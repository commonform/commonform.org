module.exports = dropZone

var h = require('virtual-dom/h')

var OVER_CLASS = 'over'

function dropZone(state) {
  var emit = state.emit
  var path = state.path
  var properties = {
    className: 'dropZone',
    ondragover: onDragOver,
    ondragleave: onDragLeave,
    ondrop: function(event) {
      event.preventDefault()
      var data = event.dataTransfer.getData('json')
      var fromPath = JSON.parse(data)
      this.classList.remove(OVER_CLASS)
      emit('move', fromPath, path) } }
  return h('div', properties) }

function onDragOver(event) {
  event.preventDefault()
  this.classList.add(OVER_CLASS) }

function onDragLeave(event) {
  event.preventDefault()
  this.classList.remove(OVER_CLASS) }
