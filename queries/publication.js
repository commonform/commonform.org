var API = require('../api-server')
var ecb = require('ecb')
var simple = require('./simple')

module.exports = function (publication, callback) {
  var uri = (
    API +
    '/publishers/' + publication.publisher +
    '/projects/' + publication.project +
    '/publications/' + publication.edition
  )
  simple(uri, ecb(callback, function (body) {
    callback(null, body.digest)
  }))
}
