module.exports = blank

var deepEqual = require('deep-equal')
var find = require('array-find')
var h = require('virtual-dom/h')

function blank(state) {
  var blanks = state.blanks
  var emit = state.emit
  var path = state.path
  var direction = find(blanks, function(element) {
    return deepEqual(element.blank, path) })
  return h('input.blank',
    { direction: ( direction ? direction.value : '' ),
      onchange: function(event) {
        emit('blank', path, event.target.value) } }) }
