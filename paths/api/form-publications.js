var assert = require('assert')

module.exports = function (digest) {
  assert.equal(typeof digest, 'string')
  return (
    '/forms/' + encodeURIComponent(digest) +
    '/publications'
  )
}
