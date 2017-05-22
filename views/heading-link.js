var assert = require('assert')
var html = require('../html')

module.exports = function (heading) {
  assert(typeof heading === 'string')
  return html`
    <a
        class=heading
        href="/search/forms/${encodeURIComponent(heading)}"
      >${heading}</a>
  `
}
