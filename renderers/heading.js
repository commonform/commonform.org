var h = require('virtual-dom/h')

function heading(state) {
  if (state.data) {
    return h('div.heading', state.data) } }

module.exports = heading
