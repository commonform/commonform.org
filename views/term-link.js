var assert = require('assert')
var collapsed = require('../html/collapsed')

module.exports = function (term) {
  assert.equal(typeof term, 'string')
  return collapsed`
    <a
        class=term
        href="/search/definitions/${encodeURIComponent(term)}"
      >${term}</a>
  `
}
