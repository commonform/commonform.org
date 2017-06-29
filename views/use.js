var assert = require('assert')
var collapsed = require('../html/collapsed')

module.exports = function (term) {
  assert(typeof term === 'string')
  return collapsed`
    <a  class=use
        title="Jump to definition of ${term}"
        href="#Definition:${term}"
      >${term}</a>
  `
}
