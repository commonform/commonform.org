var h = require('virtual-dom/h')
var nameID = require('../name-id')

function heading(state) {
  var text = state.data
  if (state.data) {
    return h('div.heading',
      { id: nameID(state.digest, 'heading', text) },
      text) } }

module.exports = heading
