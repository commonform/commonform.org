var h = require('virtual-dom/h')

function titleInput(state) {
  function onChange(event) {
    state.emit('title', event.target.value) }
  return h('input',
    { type: 'text',
      value: state.title,
      onchange: onChange,
      onblur: onChange }) }

module.exports = titleInput
