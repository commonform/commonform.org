var h = require('virtual-dom/h')

function blankInput(state) {
  return h('input.blank', {
    placeholder: 'Enter a value',
    value: (
      state.blank in state.values ?
        state.values[state.blank] :
        '' ),
    onchange: function(event) {
      state.update(function(current) {
        var newValue = event.target.value
        if (newValue.length > 0) {
          current.blanks[state.blank] = event.target.value }
        else {
          delete current.blanks[state.blank] } }) } }) }

module.exports = blankInput
