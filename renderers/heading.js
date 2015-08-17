var h = require('virtual-dom/h')

function heading(state) {
  if (state.data) {
    return h('div.heading',
      { id: 'heading:' + state.data },
      state.data) } }

module.exports = heading
