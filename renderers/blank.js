module.exports = blank

var deepEqual = require('deep-equal')
var find = require('array-find')
var h = require('virtual-dom/h')

function blank(state) {
  console.log(state)
  var blanks = state.blanks
  var emit = state.emit
  var path = state.path
  var direction = find(blanks, function(element) {
    return deepEqual(element.blank, path) })
  var value = ( direction ? direction.value : '' )
  return (
    value.length > 0 ?
      h('span.blank',
        { },
        [ value,
          h('a.clear',
            { title: 'Clear',
              onclick: function() {
                emit('blank', path, undefined) } }) ]) :
      [ h('a.flag', { title: 'Fill-in-the-Blank' }, '✍'),
        h('input.blank',
          { direction: value,
            onchange: function(event) {
              emit('blank', path, event.target.value) } }) ] ) }
