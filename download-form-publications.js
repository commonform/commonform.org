const http = require('choo/http')

module.exports = function (digest, callback) {
  var uri = 'https://api.commonform.org/forms/' + digest + '/publications'
  http(uri, {json: true}, function (error, response, body) {
    if (error) callback(error)
    else {
      if (response.statusCode !== 200) {
        callback(new Error('Server responded ' + response.statusCode + '.'))
      } else {
        if (!body) callback(new Error('No body received,'))
        else callback(null, body)
      }
    }
  })
}
