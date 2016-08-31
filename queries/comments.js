var API = require('../api-server')
var simple = require('./simple')

module.exports = function (digest, callback) {
  var uri = API + '/annotations' + '?context=' + digest
  simple(uri, function (error, comments) {
    if (error) {
      var status = error.statusCode
      if (status === 404 || status === 400) {
        callback(null, [])
      } else {
        callback(error)
      }
    } else {
      callback(error, comments)
    }
  })
}
