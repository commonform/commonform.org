var assert = require('assert')
var html = require('yo-yo')

module.exports = function (term) {
  assert(typeof term === 'string')
  return html`
    <dfn
        title="Definition of ${term}"
        id="Definition:${term}"
      >${term}</dfn>
  `
}
