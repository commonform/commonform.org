var simple = require('./simple')

module.exports = function (callback) {
  var uri = 'https://api.commonform.org/publishers'
  simple(uri, callback)
}
