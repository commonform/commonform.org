var h = require('virtual-dom/h')

function blankInput(state) {
  var blank = state.blank
  var values = state.values
  return h('input.blank', {
    placeholder: 'Enter a value',
    value: ( blank in state.values ? values[blank] : '' ),
    onchange: function(event) {
      state.emit('blank', blank, event.target.value) } }) }

module.exports = blankInput
