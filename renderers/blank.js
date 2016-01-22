module.exports = blank

var deepEqual = require('deep-equal')
var find = require('array-find')
var input = require('./replaceable-input')

function blank(state) {
  var blanks = state.blanks
  var emit = state.emit
  var path = state.path
  var direction = find(blanks, function(element) {
    return deepEqual(element.blank, path) })
  var value = ( direction ? direction.value : '' )
  return input(
    value,
    function(value) {
      emit('blank', path, value) },
    function() {
      emit('blank', path, undefined) }) }
