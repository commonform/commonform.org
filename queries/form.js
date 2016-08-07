var simple = require('./simple')

module.exports = function (digest, callback) {
  simple('https://api.commonform.org/forms/' + digest, callback)
}
