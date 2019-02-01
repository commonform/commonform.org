var assert = require('assert')

module.exports = function (digest) {
  assert.strictEqual(typeof digest, 'string')
  return (
    '/forms/' + encodeURIComponent(digest) +
    '/publications'
  )
}
