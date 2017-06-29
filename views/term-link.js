var assert = require('assert')

module.exports = function (term) {
  assert.equal(typeof term, 'string')
  var a = document.createElement('a')
  a.className = 'term'
  a.href = '/search/definitions/' + encodeURIComponent(term)
  return a
}
