var assert = require('assert')
var html = require('yo-yo')

module.exports = function (heading, send) {
  assert.equal(typeof heading, 'string')
  assert.equal(typeof send, 'function')
  return html`
    <a
        class=heading
        href="/search/forms/${encodeURIComponent(heading)}"
      >${heading}</a>
  `
}

