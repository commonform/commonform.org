var webdriverio = require('webdriverio')

module.exports = function() {
  return webdriverio
    .remote()
    .init()
    .url('http://localhost:8000')
}
