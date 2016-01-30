module.exports = text

var h = require('virtual-dom/h')
var improvePunctuation = require('../utility/improve-punctuation')

function text(text) {
  return h('span', improvePunctuation(text)) }
