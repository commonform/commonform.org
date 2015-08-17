var h = require('virtual-dom/h')

function titleInput(state) {
  return h('div.title', [
    h('input.title',
      { value: state.title,
        onchange: function(event) {
          state.emit('title', event.target.value) } }) ]) }

module.exports = titleInput
