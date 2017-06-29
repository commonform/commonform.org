var assert = require('assert')
var collapsed = require('../html/collapsed')

module.exports = function publisherLink (publisher, send) {
  assert(typeof publisher === 'string')
  assert(typeof send === 'function')
  return collapsed`
    <a
        class=publisher
        href="/publishers/${encodeURIComponent(publisher)}"
      >${publisher}</a>
  `
}
