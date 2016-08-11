
var simple = require('./simple')

module.exports = function (digest, callback) {
  var uri = (
    'https://api.commonform.org/annotations' +
    '?context=' + digest
  )
  simple(uri, callback)
}
