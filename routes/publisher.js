var escape = require('../util/escape')
var get = require('simple-get')
var internalError = require('./internal-error')
var methodNotAllowed = require('./method-not-allowed')
var projectFrontEndPath = require('../paths/front-end/project')
var publisherAPIPath = require('../paths/api/publisher')
var runParallel = require('run-parallel')
var sanitize = require('../util/sanitize')

var editionLink = require('./partials/edition-link')
var footer = require('./partials/footer')
var gravatar = require('./partials/gravatar')
var html = require('./html')
var preamble = require('./partials/preamble')

module.exports = function (configuration, request, response) {
  if (request.method !== 'GET') {
    return methodNotAllowed.apply(null, arguments)
  }
  var publisher = sanitize(request.params.publisher)
  var publisherURL = 'https://' + configuration.repository + publisherAPIPath(publisher)
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
        return done(error, projects)
      })
    }
  }, function (error, data) {
    if (error) {
      return internalError(configuration, request, response, error)
    }
    response.setHeader('Content-Type', 'text/html; charset=UTF-8')
    response.end(html`
    ${preamble()}
<header>
  <a href=/>${escape(configuration.domain)}</a> /
  ${escape(publisher)}
</header>
<main>
  <article>
    <section>
      ${avatar(data.publisher)}
      ${about(data.publisher)}
    </section>
    <section>${projectsList(data.projects)}</section>
  </article>
</main>
${footer()}
    `)
  })

  function avatar (publisher) {
    if (!publisher.gravatar) return ''
    return gravatar(publisher)
  }

  function about (publisher) {
    if (!publisher.about) return ''
    return html`<p>${escape(publisher.about)}</p>`
  }

  function projectsList (projects) {
    return html`<h2>Published Projects</h2><ul>${projects.map(projectLI)}</ul>
    `
  }

  function projectLI (project) {
    var url = projectFrontEndPath(publisher, project)
    return html`
      <li>
        ${escape(project)}:
        <a href="${url}">editions</a>,
        ${editionLink({publisher, project, edition: 'current'})},
        ${editionLink({publisher, project, edition: 'latest'})}
      </li>
    `
  }
}
