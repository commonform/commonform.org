var Busboy = require('busboy')
var descriptionRepositoryPath = require('../paths/repository/description')
var https = require('https')
var methodNotAllowed = require('./method-not-allowed')
var projectFrontEndPath = require('../paths/front-end/project')
var pump = require('pump')

module.exports = function (request, response) {
  if (request.method !== 'POST') {
    return methodNotAllowed.apply(null, arguments)
  }
  var fields = ['password', 'publisher', 'description', 'project']
  var data = { replyTo: [] }
  pump(
    request,
    new Busboy({ headers: request.headers })
      .on('field', function (name, value) {
        if (value && fields.includes(name)) {
          data[name] = value.trim().replace(/\r\n/g, '\n')
        }
      })
      .once('finish', function () {
        var host = process.env.REPOSITORY
        var auth = data.publisher + ':' + data.password
        https.request({
          method: 'PUT',
          host,
          path: descriptionRepositoryPath(data.publisher, data.project),
          auth
        })
          .once('response', function (response) {
            request.log.info(response, 'Repository: description')
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
