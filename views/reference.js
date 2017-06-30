var assert = require('assert')
var h = require('../h')

module.exports = function reference (heading) {
  assert(typeof heading === 'string')
  return h('a.reference', {
    title: 'Jump to ' + heading,
    href: '#Heading:' + heading
  }, heading)
}
