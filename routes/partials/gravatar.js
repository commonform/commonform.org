var crypto = require('crypto')

module.exports = function (address) {
  return `<img src=https://www.gravatar.com/avatar/${compute(address)}>`
}

function compute (address) {
  var hash = crypto.createHash('md5')
  hash.update(address.trim())
  return hash.digest('hex').toLowerCase()
}
