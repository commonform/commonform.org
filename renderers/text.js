module.exports = text

var h = require('virtual-dom/h')

function text(text) {
  return h('span', text) }
