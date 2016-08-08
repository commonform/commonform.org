var app = require('choo')({
  onError: function (error, state, createSend) {
    createSend('onError:')('form:error', error)
  }
})

app.model(require('./models/global'))
app.model(require('./models/form'))
app.model(require('./models/browser'))

var projects = require('./views/projects')
var publishers = require('./views/publishers')
var read = require('./views/read')
var redirect = require('./views/redirect')
var welcome = require('./views/welcome')

app.router('/notFound', function (route) {
  return [
    route('/', welcome),
    route('/notFound', require('./views/not-found')),
    route('/forms', [
      route('/:digest', read)
    ]),
    route('/publishers', publishers, [
      route('/:publisher', projects)
    ]),
    route('/publications', [
      route('/:publisher', [
        route('/:project', redirect, [
          route('/:edition', redirect)
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
