var simple = require('./simple')

module.exports = function (publisher, project, callback) {
  var uri = (
    'https://api.commonform.org' +
    '/publishers/' + encodeURIComponent(publisher) +
    '/projects/' + encodeURIComponent(project) +
    '/publications'
  )
  simple(uri, callback)
}
