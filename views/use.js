var assert = require('assert')
var h = require('../h')

module.exports = function use (term) {
  assert(typeof term === 'string')
  return h('a.use', {
    className: 'use',
    title: 'Jump to definition of ' + term,
    href: '#Definition:' + term
  }, term)
}
