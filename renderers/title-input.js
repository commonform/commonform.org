var h = require('virtual-dom/h')

function titleInput(state) {
  return h('div.title', [
    h('form',
      { onsubmit: function(event) {
          event.preventDefault() } },
      [ h('input',
          { type: 'text',
            value: state.title,
            onchange: function(event) {
              state.emit('title', event.target.value) } }),
        ' ',
        h('input', { type: 'submit', value: 'Change Title' }) ]) ]) }

module.exports = titleInput
