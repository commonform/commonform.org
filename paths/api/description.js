var assert = require('assert')

module.exports = function (publisher, project) {
  assert.equal(typeof publisher, 'string')
  assert.equal(typeof project, 'string')
  return (
    '/publishers/' + encodeURIComponent(publisher) +
    '/projects/' + encodeURIComponent(project) +
    '/description'
  )
}
