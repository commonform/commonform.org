var Busboy = require('busboy')
var https = require('https')
var methodNotAllowed = require('./method-not-allowed')
var pump = require('pump')

module.exports = function (configuration, request, response) {
  if (request.method !== 'POST') {
    return methodNotAllowed.apply(null, arguments)
  }
  var fields = [
    'context', 'form', 'password', 'publisher', 'replyTo[]', 'text',
    'subscribe'
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
        var host = configuration.api.replace(/^https:\/\//, '')
        var auth = data.publisher + ':' + data.password
        var uuid
        https.request({
          method: 'POST',
          host,
          path: '/annotations',
          headers: {'Content-Type': 'application/json'},
          auth
        })
          .once('response', function (response) {
            var statusCode = response.statusCode
            if (statusCode === 204 || statusCode === 201) {
              uuid = response.headers.location.replace('/annotations/', '')
              if (!data.subscribe) return redirect()
              var path = `/annotations/${uuid}/subscribers/${data.publisher}`
              https.request({
                method: 'POST', host, path, auth
              })
                .once('response', function (response) {
                  var statusCode = response.statusCode
                  if (statusCode !== 204 && statusCode === 201) {
                    configuration.log.error(
                      {statusCode, path}
                    )
                  }
                  redirect()
                })
                .end()
            } else {
              configuration.log.error({statusCode, path: '/annotations'})
            }
          })
          .end(JSON.stringify(body))
        function redirect () {
          response.statusCode = 303
          response.setHeader('Location', '/forms/' + data.form + '#' + uuid)
          response.end()
        }
      })
  )
}
