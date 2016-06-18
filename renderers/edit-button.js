module.exports = editButton

var h = require('virtual-dom/h')

function editButton(state) {
  var editing = state.editing
  var emit = state.emit
  return h('button',
    { onclick: function() { emit('editing', !editing) } },
    [ ( editing ? 'Read' : 'Edit' ) ]) }
