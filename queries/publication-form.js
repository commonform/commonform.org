var ecb = require('ecb')
var getForm = require('./form')
var getPublication = require('./publication')

module.exports = function (publication, callback) {
  getPublication(publication, ecb(callback, function (digest) {
    getForm(digest, ecb(callback, function (tree) {
      callback(null, tree, digest)
    }))
  }))
}
