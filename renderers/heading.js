var h = require('virtual-dom/h')

function heading(state) {
  var text = state.data
  if (state.data) {
    return h('div.heading', { id: 'heading:' + text }, text) } }

module.exports = heading
