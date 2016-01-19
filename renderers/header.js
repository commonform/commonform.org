module.exports = header

var h = require('virtual-dom/h')
var renderDigest = require('./digest')
var thunk = require('vdom-thunk')

function header(digest) {
  return h('header', [ thunk(renderDigest, digest) ]) }
