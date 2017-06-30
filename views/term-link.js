var assert = require('assert')
var h = require('../h')

module.exports = function termLink (term) {
  assert.equal(typeof term, 'string')
  return h('a.term', {
    href: '/search/definitions/' + encodeURIComponent(term)
  }, term)
}
