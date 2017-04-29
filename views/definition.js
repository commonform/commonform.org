var assert = require('assert')
var html = require('bel')

module.exports = function (term) {
  assert(typeof term === 'string')
  return html`
    <dfn
        title="Definition of ${term}"
        data-term="${term}"
        id="Definition:${term}"
      >${term}</dfn>
  `
}
