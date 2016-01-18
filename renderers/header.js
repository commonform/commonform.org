module.exports = header

var h = require('virtual-dom/h')
var renderDigest = require('./digest')

function header(state) {
  return h('header', [ renderDigest(state) ]) }
