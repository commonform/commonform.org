var simple = require('./simple')

module.exports = function (publication, callback) {
  var uri = (
    'https://api.commonform.org' +
    '/publishers/' + publication.publisher +
    '/projects/' + publication.project +
    '/publications/' + publication.edition
  )
  simple(uri, function (error, body) {
    if (error) {
      callback(error)
    } else {
      callback(null, body.digest)
    }
  })
}
