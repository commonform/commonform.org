module.exports = word

var h = require('virtual-dom/h')

function word(word) {
  return h('span', word.word) }
