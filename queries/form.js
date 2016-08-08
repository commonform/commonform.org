var cache = require('../cache')
var simple = require('./simple')

module.exports = function (digest, callback) {
  cache.get(digest, function (error, form) {
    if (error || form === undefined) {
      simple('https://api.commonform.org/forms/' + digest, callback)
    } else {
      callback(null, JSON.parse(form))
    }
  })
}
