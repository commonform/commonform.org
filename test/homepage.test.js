var concat = require('simple-concat')
var http = require('http')
var server = require('./server')
var tape = require('tape')

tape.test('GET /', function (test) {
  server(function (port, closeServer) {
    http.request({port: port})
      .once('response', function (response) {
        test.equal(
          response.statusCode, 200,
          'responds 200'
        )
        test.assert(
          response.headers['content-type'].includes('text/html'),
          'text/html'
        )
        concat(response, function (error, buffer) {
          var body = buffer.toString()
          test.ifError(error, 'no error')
          var name = 'Common Form'
          test.assert(
            body.includes(name),
            'body includes ' + JSON.stringify(name)
          )
          test.end()
          closeServer()
        })
      })
      .end()
  })
})
