module.exports = header

var h = require('virtual-dom/h')
var renderDigest = require('./digest')

function header(digest) {
  return h('header', [ renderDigest(digest) ]) }
