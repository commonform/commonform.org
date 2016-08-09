var assert = require('assert')
var html = require('yo-yo')

module.exports = function (term, send) {
  assert.equal(typeof term, 'string')
  assert.equal(typeof send, 'function')
  return html`
    <a
        class=term
        href="/search/definitions/${encodeURIComponent(term)}"
      >${term}</a>
  `
}

