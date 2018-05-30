var Busboy = require('busboy')
var https = require('https')
var methodNotAllowed = require('./method-not-allowed')
var pump = require('pump')

module.exports = function (configuration, request, response) {
  if (request.method !== 'POST') {
    return methodNotAllowed.apply(null, arguments)
  }
  var fields = [
    'context', 'form', 'password', 'publisher', 'replyTo[]', 'text'
  ]
  var data = {replyTo: []}
  pump(
    request,
    new Busboy({headers: request.headers})
      .on('field', function (name, value) {
        if (value && fields.includes(name)) {
          value = value.trim().replace(/\r\n/g, '\n')
          if (name === 'replyTo[]') {
            data.replyTo.push(value)
          } else {
            data[name] = value
          }
        }
      })
      .once('finish', function () {
        var body = {
          publisher: data.publisher,
          form: data.form,
          context: data.context,
          replyTo: data.replyTo,
          text: data.text
        }
        configuration.log.info(body, 'body')
        configuration.log.info(data, 'data')
        https.request({
          method: 'POST',
          host: configuration.api.replace(/^https:\/\//, ''),
          path: '/annotations',
          headers: {'Content-Type': 'application/json'},
          auth: data.publisher + ':' + data.password
        })
          .once('response', function (response) {
            var statusCode = response.statusCode
            if (statusCode === 204 || statusCode === 201) {
              var uuid = response.headers.location.replace('/annotations/', '')
              response.statusCode = 303
              response.setHeader('Location', '/forms/' + data.form + '#' + uuid)
              response.end()
            } else {
              configuration.log.error(response.statusCode, 'status code')
            }
          })
          .end(JSON.stringify(body))
      })
  )
  response.end()
}
