var fs = require('fs')
var handler = require('../')
var http = require('http')
var pino = require('pino')

module.exports = function (test) {
  var configuration = {
    log: pino(fs.createWriteStream('test-server.log')),
    domain: 'commonform.org',
    api: 'https://api.commonform.org'
  }
  http.createServer()
    .on('request', function (request, response) {
      try {
        handler(configuration, request, response)
      } catch (error) {
        console.error(error)
      }
    })
    .listen(0, function onceListening () {
      var server = this
      var port = server.address().port
      test(port, function closeServer () {
        server.close()
      }, configuration)
    })
}

process.on('uncaughtException', function (error) {
  console.error(error)
})
