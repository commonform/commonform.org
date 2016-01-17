module.exports = function() {
  return require('webdriverio')
    .remote({
      host: 'localhost',
      port: 9515,
      desiredCapabilities: { browserName: 'chrome' } })
    .init()
    .url('http://localhost:8000') }
