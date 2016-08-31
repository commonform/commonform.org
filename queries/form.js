var API = require('../api-server')
var cache = require('../cache')
var simple = require('./simple')

module.exports = function (digest, callback) {
  cache.get(digest, function (error, form) {
    if (error || form === undefined) {
      simple(API + '/forms/' + digest, callback)
    } else {
      callback(null, JSON.parse(form))
    }
  })
}
