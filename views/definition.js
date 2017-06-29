var assert = require('assert')

module.exports = function (term) {
  assert(typeof term === 'string')
  var dfn = document.createElement('dfn')
  dfn.setAttribute('titie', 'Definition of ' + term)
  dfn.id = 'Definition:' + term
  dfn.appendChild(document.createTextNode(term))
  return dfn
}
