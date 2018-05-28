var path = require('path')
var pump = require('pump')
var send = require('send')

var routes = module.exports = require('http-hash')()

routes.set('/', require('./homepage'))
routes.set('/favicon.ico', function (configuration, request, response) {
  response.statusCode = 404
  response.end()
})
routes.set('/edit', require('./edit'))
routes.set('/forms/:digest', require('./form'))
routes.set('/:publisher', require('./publisher'))
routes.set('/:publisher/:project', require('./project'))
routes.set('/:publisher/:project/:edition', require('./publication'))

staticFile('normalize.css')
staticFile('styles.css')
staticFile('editor.bundle.js')

function staticFile (file) {
  var filePath = path.join(__dirname, '..', 'static', file)
  routes.set('/' + file, function (configuration, request, response) {
    pump(send(request, filePath), response)
  })
}
