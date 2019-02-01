var fs = require('fs')
var handler = require('../')
var http = require('http')
var pino = require('pino')
var pinoHTTP = require('pino-http')

module.exports = function (test) {
  var log = pino(fs.createWriteStream('test-server.log'))
  process.env.REPOSITORY = 'api.commonform.org'
  process.env.DOMAIN = 'commonform.org'
  http.createServer()
    .on('request', function (request, response) {
      try {
        pinoHTTP({ logger: log })(request, response)
        handler(request, response)
      } catch (error) {
        console.error(error)
      }
    })
    .listen(0, function onceListening () {
      var server = this
      var port = server.address().port
      test(port, function closeServer () {
        server.close()
      }, log)
    })
}

process.on('uncaughtException', function (error) {
  console.error(error)
})
