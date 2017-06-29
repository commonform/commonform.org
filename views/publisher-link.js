var assert = require('assert')

module.exports = function publisherLink (publisher, send) {
  assert(typeof publisher === 'string')
  assert(typeof send === 'function')
  var a = document.createElement('a')
  a.className = 'publisher'
  a.href = '/publishers/' + encodeURIComponent(publisher)
  a.appendChild(document.createTextNode(publisher))
  return a
}
