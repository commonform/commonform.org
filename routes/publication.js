var escape = require('../util/escape')
var get = require('simple-get')
var internalError = require('./internal-error')
var methodNotAllowed = require('./method-not-allowed')
var runAuto = require('run-auto')
var sanitize = require('../util/sanitize')

var footer = require('./partials/footer')
var form = require('./partials/form')
var html = require('./html')
var preamble = require('./partials/preamble')
var projectLink = require('./partials/project-link')
var publisherLink = require('./partials/publisher-link')

module.exports = function (configuration, request, response) {
  if (request.method !== 'GET') {
    return methodNotAllowed.apply(null, arguments)
  }
  var publisher = sanitize(request.params.publisher)
  var project = sanitize(request.params.project)
  var edition = sanitize(request.params.edition)
  runAuto({
    publication: function (done) {
      get.concat({
        url: (
          configuration.api +
          '/publishers/' + encodeURIComponent(publisher) +
          '/projects/' + encodeURIComponent(project) +
          '/publications/' + encodeURIComponent(edition)
        ),
        json: true
      }, function (error, response, data) {
        done(error, data)
      })
    },
    form: ['publication', function (data, done) {
      get.concat({
        url: configuration.api + '/forms/' + data.publication.digest,
        json: true
      }, function (error, response, form) {
        done(error, form)
      })
    }]
  }, function (error, data) {
    if (error) {
      return internalError(configuration, request, response, error)
    }
    response.setHeader('Content-Type', 'text/html; charset=UTF-8')
    response.end(html`
    ${preamble()}
<main>
<h1>
  ${publisherLink(publisher)}’s
  ${projectLink(data.publication)}
  ${escape(edition)}
</h1>
<p>
  <a href=/forms/${data.publication.digest}>${data.publication.digest}</a>
</p>
<article class=commonform>${form(data.form)}</article>
</main>
${footer()}
    `)
  })
}
