var h = require('virtual-dom/h')

function blankInput(state) {
  var blank = state.blank
  var values = state.values
  var emit = state.emit
  return h('input', {
    value: ( blank in state.values ? values[blank] : '' ),
    onchange: function(event) {
      emit('blank', blank, event.target.value) } }) }

module.exports = blankInput
