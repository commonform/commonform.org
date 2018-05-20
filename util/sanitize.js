var path = require('path')

module.exports = function (string) {
  return string
    .replace(new RegExp(path.sep, 'g'), '')
    .replace(/\.\./g, '')
}
