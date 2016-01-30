module.exports = blank

var deepEqual = require('deep-equal')
var find = require('array-find')
var improvePunctuation = require('../utility/improve-punctuation')
var input = require('./replaceable-input')
var replaceUnicode = require('../utility/replace-unicode')

function blank(state) {
  var blanks = state.blanks
  var emit = state.emit
  var path = state.path
  var direction = find(blanks, function(element) {
    return deepEqual(element.blank, path) })
  var value = (
    direction ?
      improvePunctuation(direction.value) :
      '' )
  return input(
    value,
    function(value) {
      emit('blank', path, replaceUnicode(value)) },
    function() {
      emit('blank', path, undefined) }) }
