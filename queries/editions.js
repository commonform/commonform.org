var API = require('../api-server')
var simple = require('./simple')

module.exports = function (publisher, project, callback) {
  var uri = (
    API +
    '/publishers/' + encodeURIComponent(publisher) +
    '/projects/' + encodeURIComponent(project) +
    '/publications'
  )
  simple(uri, callback)
}
