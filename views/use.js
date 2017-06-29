var assert = require('assert')

module.exports = function (term) {
  assert(typeof term === 'string')
  var a = document.createElement('a')
  a.className = 'use'
  a.title = 'Jump to definition of ' + term
  a.href = '#Definition:' + term
  a.appendChild(document.createTextNode(term))
  return a
}
