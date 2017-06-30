var assert = require('assert')

module.exports = function reference (heading) {
  assert(typeof heading === 'string')
  var a = document.createElement('a')
  a.className = 'reference'
  a.title = 'Jump to ' + heading
  a.href = '#Heading:' + heading
  a.appendChild(document.createTextNode(heading))
  return a
}
