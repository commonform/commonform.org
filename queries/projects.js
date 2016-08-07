var simple = require('./simple')

module.exports = function (publisher, callback) {
  var uri = (
    'https://api.commonform.org/publishers/' +
    encodeURIComponent(publisher) +
    '/projects'
  )
  simple(uri, callback)
}
