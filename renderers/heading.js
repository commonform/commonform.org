var h = require('virtual-dom/h')
var nameID = require('../name-id')

function heading(state) {
  function onChange(event) {
    var newValue = event.target.value
    state.emit('set', state.path, newValue) }
  var text = state.data
  if (state.data) {
    return h('input.heading',
      { id: nameID(state.digest, 'heading', text),
        value: text,
        onchange: onChange,
        onblug: onChange }) } }

module.exports = heading
