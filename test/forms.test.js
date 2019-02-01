var concat = require('simple-concat')
var http = require('http')
var server = require('./server')
var tape = require('tape')

;(function () {
  var path = '/test/test/1e'
  tape.test(`GET ${path}`, function (test) {
    server(function (port, closeServer) {
      http.request({ port, path })
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
            test.ifError(error, 'no concat error')
            test.assert(
              body.includes('This is a test form.'),
              'body includes form text'
            )
            test.end()
            closeServer()
          })
        })
        .end()
    })
  })
})()

;(function () {
  var digest = (
    '543cd5e172cfc6b3c20a0d91855fea44' +
    'b5bf2fd1da7bf6b7c69f95d6e2705c37'
  )
  var path = `/edit?from=${digest}`
  tape.test(`GET ${path}`, function (test) {
    server(function (port, closeServer) {
      http.request({ port, path })
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
            test.ifError(error, 'no concat error')
            test.assert(
              body.includes('This is a test form.'),
              'body includes form text'
            )
            test.end()
            closeServer()
          })
        })
        .end()
    })
  })
})()
