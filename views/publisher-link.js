var assert = require('assert')
var html = require('bel')

module.exports = function publisherLink (publisher, send) {
  assert(typeof publisher === 'string')
  assert(typeof send === 'function')
  return html`
    <a
        class=publisher
        href="/publishers/${encodeURIComponent(publisher)}"
      >${publisher}</a>
  `
}
