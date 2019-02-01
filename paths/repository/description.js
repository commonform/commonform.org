var assert = require('assert')

module.exports = function (publisher, project) {
  assert.strictEqual(typeof publisher, 'string')
  assert.strictEqual(typeof project, 'string')
  return (
    '/publishers/' + encodeURIComponent(publisher) +
    '/projects/' + encodeURIComponent(project) +
    '/description'
  )
}
