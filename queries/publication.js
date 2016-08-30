var ecb = require('ecb')
var simple = require('./simple')

module.exports = function (publication, callback) {
  var uri = (
    'https://api.commonform.org' +
    '/publishers/' + publication.publisher +
    '/projects/' + publication.project +
    '/publications/' + publication.edition
  )
  simple(uri, ecb(callback, function (body) {
    callback(null, body.digest)
  }))
}
