var ecb = require('ecb')
var getForm = require('./form')
var getPublication = require('./publication')

module.exports = function (publication, callback) {
  getPublication(publication, ecb(callback, function (body) {
    getForm(body.digest, ecb(callback, function (tree) {
      callback(null, tree, body.digest, body.signaturePages)
    }))
  }))
}
