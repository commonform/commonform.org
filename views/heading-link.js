var assert = require('assert')

module.exports = function (heading) {
  assert(typeof heading === 'string')
  var a = document.createElement('a')
  a.className = 'heading'
  a.href = '/search/forms/' + encodeURIComponent(heading)
  a.appendChild(document.createTextNode(heading))
  return a
}
