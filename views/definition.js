var assert = require('assert')
var h = require('../h')

module.exports = function definition (term) {
  assert(typeof term === 'string')
  return h('dfn', {
    title: 'Definition of ' + term,
    id: 'Definition:' + term
  }, term)
}
