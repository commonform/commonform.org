var escape = require('../../util/escape')

module.exports = function (name) {
  return `<a href="/${escape(name)}">${escape(name)}</a>`
}
