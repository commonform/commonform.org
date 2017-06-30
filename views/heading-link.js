var assert = require('assert')
var h = require('../h')

module.exports = function headingLink (heading) {
  assert(typeof heading === 'string')
  return h('a.heading', {
    href: '/search/forms/' + encodeURIComponent(heading)
  }, heading)
}
