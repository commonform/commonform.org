var http = require('http')
var server = require('./server')
var tape = require('tape')

var TEST_STATUS = [
  {path: '/', status: 200},
  {path: '/favicon.ico', status: 200},
  {path: '/normalize.css', status: 200},
  {path: '/styles.css', status: 200},
  {path: '/edit', status: 200},
  {path: '/test', status: 200},
  {path: '/test/test', status: 200},
  {path: '/test/test/1e', status: 200},
  {path: '/test/test/current', status: 303},
  {path: '/test/test/latest', status: 303}
]

TEST_STATUS.forEach(function (pair) {
  var path = pair.path
  var status = pair.status
  tape.test('GET ' + path, function (test) {
    server(function (port, closeServer) {
      http.request({port: port, path})
        .once('response', function (response) {
          test.equal(
            response.statusCode, status,
            'responds ' + status
          )
          test.end()
          closeServer()
        })
        .end()
    })
  })
})
