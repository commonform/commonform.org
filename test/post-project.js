var assert = require('assert')
var http = require('http')
var merkleize = require('commonform-merkleize')
var postForm = require('./post-form')
var runSeries = require('run-series')

var TERRIBLE_PASSWORD = 'not a good password!'

module.exports = function (
  publisher, project, edition, form, callback
) {
  assert(typeof publisher === 'string')
  assert(typeof project === 'string')
  assert(typeof edition === 'string')
  assert(typeof form === 'object')
  assert(typeof callback === 'function')
  var digest = merkleize(form).digest
  runSeries([
    function (done) {
      postForm(form, done)
    },
    function (done) {
      createPublisher(publisher, done)
    },
    function (done) {
      publish(publisher, project, edition, digest, done)
    }
  ], callback)
}

function createPublisher (publisher, callback) {
  http.request({
    method: 'POST',
    host: 'localhost',
    port: 8081,
    path: '/publishers/' + publisher,
    auth: 'administrator:test'
  }, function (response) {
    var code = response.statusCode
    if (code === 204 || code === 409) {
      callback()
    } else {
      callback(new Error('Responded ' + code))
    }
  })
    .end(JSON.stringify({
      about: '',
      email: publisher + '@example.com',
      password: TERRIBLE_PASSWORD
    }))
}

function publish (publisher, project, edition, digest, callback) {
  http.request({
    method: 'POST',
    host: 'localhost',
    port: 8081,
    path: (
      '/publishers/' + publisher +
      '/projects/' + project +
      '/publications/' + edition
    ),
    auth: publisher + ':' + TERRIBLE_PASSWORD
  }, function (response) {
    var code = response.statusCode
    if (code === 204 || code === 409) {
      callback()
    } else {
      callback(new Error('Responded ' + code))
    }
  })
    .end(JSON.stringify({
      digest: digest
    }))
}
