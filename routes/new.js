var commonformMarkupStringify = require('commonform-markup-stringify')
var escape = require('../util/escape')
var get = require('simple-get')
var internalError = require('./internal-error')
var methodNotAllowed = require('./method-not-allowed')
var runAuto = require('run-auto')

var footer = require('./partials/footer')
var html = require('./html')
var preamble = require('./partials/preamble')

module.exports = function (configuration, request, response) {
  if (request.method === 'GET') {
    return getResponse.apply(this, arguments)
  } else {
    return methodNotAllowed.apply(null, arguments)
  }
}

function getResponse (configuration, request, response) {
  var digest = request.query.from
  runAuto({
    form: function (done) {
      if (!digest) return done()
      get.concat({
        url: configuration.api + '/forms/' + digest,
        json: true
      }, function (error, response, data) {
        done(error, data)
      })
    }
  }, function (error, data) {
    if (error) {
      return internalError(configuration, request, response, error)
    }
    console.log(data.form)
    var markup = data.form ? commonformMarkupStringify(data.form) : ''
    response.setHeader('Content-Type', 'text/html; charset=UTF-8')
    response.end(html`
    ${preamble()}
  <main>
    <form method=post action=/new>
      <textarea class=editor name=markup>${escape(markup)}</textarea>
      <button type=submit>Save</button>
    </form>
  </main>
  ${footer()}
    `)
  })
}
