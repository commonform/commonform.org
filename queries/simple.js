var http = require('xhr')

module.exports = function (uri, callback) {
  http(uri, {json: true}, function (error, response, body) {
    if (error) {
      callback(error)
    } else {
      if (response.statusCode !== 200) {
        var newError = new Error(
          'Server responded ' + response.statusCode + '.'
        )
        newError.statusCode = response.statusCode
        callback(newError)
      } else {
        if (!body) {
          callback(new Error('No body received,'))
        } else {
          callback(null, body)
        }
      }
    }
  })
}
