var http = require('choo/http')

module.exports = function (publication, callback) {
  var uri = (
    'https://api.commonform.org' +
    '/publishers/' + publication.publisher +
    '/projects/' + publication.project +
    '/publications/' + publication.edition
  )
  http(uri, {json: true}, function (error, response, body) {
    if (error) callback(error)
    else {
      if (response.statusCode !== 200) {
        callback(
          new Error('Server responded ' + response.statusCode + '.')
        )
      } else {
        if (!body) callback(new Error('No body received,'))
        else callback(null, body.digest)
      }
    }
  })
}
