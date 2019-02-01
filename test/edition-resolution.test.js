var http = require('http')
var server = require('./server')
var tape = require('tape')

;(function () {
  var publisher = 'test'
  var project = 'latest-is-draft'
  var latest = `/${publisher}/${project}/latest`
  var current = `/${publisher}/${project}/current`

  tape.test(`GET ${latest}`, function (test) {
    server(function (port, closeServer) {
      http.request({ port: port, path: latest })
        .once('response', function (response) {
          test.equal(
            response.statusCode, 303,
            'responds 303'
          )
          test.equal(
            response.headers.location,
            `/${publisher}/${project}/1e1u1d`,
            'redirects to latest draft'
          )
          test.end()
          closeServer()
        })
        .end()
    })
  })

  tape.test(`GET ${current}`, function (test) {
    server(function (port, closeServer) {
      http.request({ port: port, path: current })
        .once('response', function (response) {
          test.equal(
            response.statusCode, 303,
            'responds 303'
          )
          test.equal(
            response.headers.location,
            `/${publisher}/${project}/1e`,
            'redirects to current edition'
          )
          test.end()
          closeServer()
        })
        .end()
    })
  })
})()
