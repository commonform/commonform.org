module.exports = header

var h = require('virtual-dom/h')
var digest = require('./digest')

function header(state) {
  return h('header', [ digest(state) ]) }
