var assert = require('assert')
var h = require('../h')

module.exports = function publisherLink (publisher, send) {
  assert(typeof publisher === 'string')
  assert(typeof send === 'function')
  return h('a.publisher', {
    href: '/publishers/' + encodeURIComponent(publisher)
  }, publisher)
}
