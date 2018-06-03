var Busboy = require('busboy')
var descriptionAPIPath = require('../paths/api/description')
var https = require('https')
var methodNotAllowed = require('./method-not-allowed')
var projectFrontEndPath = require('../paths/front-end/project')
var pump = require('pump')

module.exports = function (configuration, request, response) {
  if (request.method !== 'POST') {
    return methodNotAllowed.apply(null, arguments)
  }
  var fields = ['password', 'publisher', 'description', 'project']
  var data = {replyTo: []}
  pump(
    request,
    new Busboy({headers: request.headers})
      .on('field', function (name, value) {
        if (value && fields.includes(name)) {
          data[name] = value.trim().replace(/\r\n/g, '\n')
        }
      })
      .once('finish', function () {
        var host = configuration.api.replace(/^https:\/\//, '')
        var auth = data.publisher + ':' + data.password
        https.request({
          method: 'PUT',
          host,
          path: descriptionAPIPath(data.publisher, data.project),
          auth
        })
          .once('response', function (response) {
            configuration.log.info(response, 'API: description')
            // TODO: Notify user of errors setting description.
            redirect()
          })
          .end(JSON.stringify(data.description))
      })
  )
  function redirect () {
    response.statusCode = 303
    response.setHeader('Location', projectFrontEndPath(data.publisher, data.project))
    response.end()
  }
}
