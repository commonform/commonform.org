var ecb = require('ecb')
var xhr = require('xhr')

module.exports = function (uri, callback) {
  var options = {
    uri: uri,
    json: true,
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json'
    }
  }
  xhr(options, ecb(callback, function (response, body) {
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
  }))
}
