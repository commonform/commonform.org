var simple = require('./simple')

module.exports = function (digest, callback) {
  var uri = (
    'https://api.commonform.org' +
    '/forms/' + digest + '/publications'
  )
  simple(uri, callback)
}
