var assert = require('assert')
var collapsed = require('../html/collapsed')

module.exports = function (heading) {
  assert(typeof heading === 'string')
  return collapsed`
    <a  class=reference
        title="Jump to ${heading}"
        href="#Heading:${heading}"
        >${heading}</a>`
}
