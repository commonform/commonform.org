var assert = require('assert')
var collapsed = require('../html/collapsed')

module.exports = function (term) {
  assert(typeof term === 'string')
  return collapsed`
    <dfn
        title="Definition of ${term}"
        id="Definition:${term}"
      >${term}</dfn>
  `
}
