var DOCX_CONTENT_TYPE = require('docx-content-type')
var concat = require('simple-concat')
var http = require('http')
var parse = require('json-parse-errback')
var server = require('./server')
var tape = require('tape')

;(function () {
  var publisher = 'test'
  var project = 'test'
  var edition = '1e'
  var pathForJSON = `/${publisher}/${project}/${edition}?format=json`
  var digest = (
    '543cd5e172cfc6b3c20a0d91855fea44' +
    'b5bf2fd1da7bf6b7c69f95d6e2705c37'
  )
  var pathForDOCX = `/${publisher}/${project}/${edition}?format=docx`

  tape.test(`GET ${pathForJSON}`, function (test) {
    server(function (port, closeServer) {
      http.request({ port, path: pathForJSON })
        .once('response', function (response) {
          test.equal(
            response.statusCode, 200,
            'responds 200'
          )
          test.assert(
            response.headers['content-type'].includes('json'),
            'Content-Type is JSON'
          )
          concat(response, function (error, buffer) {
            test.ifError(error, 'no concat error')
            parse(buffer, function (error, json) {
              test.ifError(error, 'valid JSON body')
              test.equal(json.digest, digest, 'digest')
              test.equal(json.publisher, publisher, 'publisher')
              test.equal(json.project, project, 'project')
              test.equal(json.edition, edition, 'edition')
              test.deepEqual(
                json.form, { content: ['This is a test form.'] }, 'form'
              )
              test.end()
              closeServer()
            })
          })
        })
        .end()
    })
  })

  tape.test(`GET ${pathForDOCX}`, function (test) {
    server(function (port, closeServer) {
      http.request({ port, path: pathForDOCX })
        .once('response', function (response) {
          test.equal(
            response.statusCode, 200,
            'responds 200'
          )
          test.equal(
            response.headers['content-type'],
            DOCX_CONTENT_TYPE,
            'Content-Type is DOCX'
          )
          test.end()
          closeServer()
        })
        .end()
    })
  })
})()
