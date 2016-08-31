var API = require('../api-server')
var simple = require('./simple')

module.exports = function (publisher, callback) {
  var uri = (
    API +
    '/publishers/' +
    encodeURIComponent(publisher) +
    '/projects'
  )
  simple(uri, callback)
}
