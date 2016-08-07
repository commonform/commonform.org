var app = require('choo')({
  onError: function (error, state, createSend) {
    createSend('onError:')('form:error', error)
  }
})

app.model(require('./models/popstate'))
app.model(require('./models/form'))
app.model(require('./models/browser'))

var read = require('./views/read')
var publishers = require('./views/publishers')
var projects = require('./views/projects')
var redirectToForm = require('./views/redirect-to-form')

app.router('/notFound', function (route) {
  return [
    route('/', read),
    route('/notFound', require('./views/not-found')),
    route('/forms', [
      route('/:digest', read)
    ]),
    route('/publishers', publishers, [
      route('/:publisher', projects)
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
