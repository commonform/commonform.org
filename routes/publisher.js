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
  var publisherURL = (
    configuration.api + '/publishers/' + encodeURIComponent(publisher)
  )
  runParallel({
    publisher: function (done) {
      get.concat({
        url: publisherURL,
        json: true
      }, function (error, response, json) {
        done(error, json)
      })
    },
    projects: function (done) {
      get.concat({
        url: publisherURL + '/projects',
        json: true
      }, function (error, response, projects) {
        if (error) return done(error)
        var queries = projects.sort().map(function (project) {
          var projectURL = (
            publisherURL + '/projects/' + encodeURIComponent(project)
          )
          return function (done) {
            get.concat({
              url: projectURL + '/publications',
              json: true
            }, function (error, response, publications) {
              done(error, {project, publications})
            })
          }
        })
        runParallel(queries, done)
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
${about(data.publisher)}
${projectsList(data.projects)}
</main>
${footer()}
    `)
  })

  function about (publisher) {
    if (!publisher.about) return ''
    return html`<p>${escape(publisher.about)}</p>`
  }

  function projectsList (projects) {
    return html`<ul>${projects.map(projectLI)}</ul>
    `
  }

  function projectLI (project) {
    return html`<li>
      ${escape(project.project)}:
      ${project.publications.map(function (publication) {
        var url = (
          '/' + encodeURIComponent(publisher) +
          '/' + encodeURIComponent(project.project) +
          '/' + encodeURIComponent(publication)
        )
        return html`<a href="${url}">${escape(publication)}</a>`
      }).join(', ')}
    </li>`
  }
}
