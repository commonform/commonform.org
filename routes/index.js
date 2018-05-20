var path = require('path')
var pump = require('pump')
var send = require('send')

var routes = module.exports = require('http-hash')()

routes.set('/', require('./homepage'))
routes.set('/new', require('./new'))
routes.set('/forms/:digest', require('./form'))
routes.set('/:publisher', require('./publisher'))
routes.set('/:publisher/:project', require('./project'))
routes.set('/:publisher/:project/:edition', require('./publication'))

staticFile('normalize.css')
staticFile('styles.css')

function staticFile (file) {
  var filePath = path.join(__dirname, '..', 'static', file)
  routes.set('/' + file, function (configuration, request, response) {
    pump(send(request, filePath), response)
  })
}
