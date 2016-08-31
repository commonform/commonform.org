var API = require('../api-server')
var simple = require('./simple')

module.exports = function (callback) {
  var uri = API + '/publishers'
  simple(uri, callback)
}
