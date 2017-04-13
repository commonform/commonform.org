var assert = require('assert')
var html = require('yo-yo')

module.exports = function (term) {
  assert.equal(typeof term, 'string')
  return html`
    <a
        class=term
        href="/search/definitions/${encodeURIComponent(term)}"
      >${term}</a>
  `
}
