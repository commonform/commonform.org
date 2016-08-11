var assert = require('assert')
var html = require('yo-yo')

module.exports = function (heading) {
  assert.equal(typeof heading, 'string')
  return html`
    <a
        class=heading
        href="/search/forms/${encodeURIComponent(heading)}"
      >${heading}</a>
  `
}

