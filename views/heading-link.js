var assert = require('assert')
var collapsed = require('../html/collapsed')

module.exports = function (heading) {
  assert(typeof heading === 'string')
  return collapsed`
    <a
        class=heading
        href="/search/forms/${encodeURIComponent(heading)}"
      >${heading}</a>
  `
}
