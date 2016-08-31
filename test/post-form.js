var assert = require('assert')
var http = require('http')

module.exports = function (form, callback) {
  assert(typeof form === 'object')
  assert(typeof callback === 'function')
  http.request({
    method: 'POST',
    host: 'localhost',
    port: 8081,
    path: '/forms',
    auth: 'administrator:test'
  }, function (response) {
    var code = response.statusCode
    if (code === 204) {
      callback()
    } else {
      callback(new Error('Responded ' + code))
    }
  })
  .end(JSON.stringify(form))
}
