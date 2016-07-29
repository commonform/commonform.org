var app = require('choo')({
  onError: function (error, state, createSend) {
    createSend('onError:')('form:error', error)
  }
})

app.model(require('./models/popstate'))
app.model(require('./models/form'))

var read = require('./views/read')
var redirectToForm = require('./views/redirect-to-form')

app.router('/notFound', function (route) {
  return [
    route('/', read),
    route('/notFound', require('./views/not-found')),
    route('/forms', [
      route('/:digest', read)
    ]),
    route('/publications', [
      route('/:publisher', [
        route('/:project', redirectToForm, [
          route('/:edition', redirectToForm)
        ])
      ])
    ])
  ]
})

if (module.parent) module.exports = app
else {
  var tree = app.start()
  document.body.appendChild(tree)
}
