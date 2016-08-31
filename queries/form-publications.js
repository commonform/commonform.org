var API = require('../api-server')
var simple = require('./simple')

module.exports = function (digest, callback) {
  var uri = API + '/forms/' + digest + '/publications'
  simple(uri, callback)
}
