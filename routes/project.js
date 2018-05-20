var escape = require('../util/escape')
var get = require('simple-get')
var internalError = require('./internal-error')
var methodNotAllowed = require('./method-not-allowed')
var runParallel = require('run-parallel')
var sanitize = require('../util/sanitize')

var footer = require('./partials/footer')
var html = require('./html')
var preamble = require('./partials/preamble')

module.exports = function (configuration, request, response) {
  if (request.method !== 'GET') {
    return methodNotAllowed.apply(null, arguments)
  }
  var publisher = sanitize(request.params.publisher)
  var project = sanitize(request.params.project)
  runParallel({
    publications: function (done) {
      get.concat({
        url: (
          configuration.api +
          '/publishers/' + encodeURIComponent(publisher) +
          '/projects/' + encodeURIComponent(project) +
          '/publications'
        )
      }, function (error, response, publications) {
        done(error, publications)
      })
    }
  }, function (error, data) {
    if (error) {
      return internalError(configuration, request, response, error)
    }
    response.setHeader('Content-Type', 'text/html; charset=UTF-8')
    response.end(html`
    ${preamble()}
<main>
<h1>${escape(publisher)}’s Common Form Projects</h1>
<ul>
  ${data.publications.map(function (publication) {
    var href = (
      '/' + encodeURIComponent(publisher) +
      '/' + encodeURIComponent(project) +
      '/' + encodeURIComponent(publication)
    )
    return html`<li><a href="${href}">${escape(publication)}</a></li>`
  })}
</ul>
</main>
${footer()}
    `)
  })
}
