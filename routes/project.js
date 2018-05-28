var escape = require('../util/escape')
var get = require('simple-get')
var internalError = require('./internal-error')
var methodNotAllowed = require('./method-not-allowed')
var reviewersEditionCompare = require('reviewers-edition-compare')
var reviewersEditionSpell = require('reviewers-edition-spell')
var runAuto = require('run-auto')
var runParallel = require('run-parallel')
var sanitize = require('../util/sanitize')

var editionLink = require('./partials/edition-link')
var footer = require('./partials/footer')
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
  runAuto({
    publications: function (done) {
      get.concat({
        url: (
          configuration.api +
          '/publishers/' + encodeURIComponent(publisher) +
          '/projects/' + encodeURIComponent(project) +
          '/publications'
        ),
        json: true
      }, function (error, response, publications) {
        done(error, publications.sort(reviewersEditionCompare))
      })
    },
    dependents: function (done) {
      get.concat({
        url: (
          configuration.api +
          '/publishers/' + encodeURIComponent(publisher) +
          '/projects/' + encodeURIComponent(project) +
          '/dependents'
        ),
        json: true
      }, function (error, response, dependents) {
        if (error) return done(error)
        runParallel(dependents.map(function (dependent) {
          var digest = dependent.parent
          return function (done) {
            get.concat({
              url: (
                configuration.api +
                '/forms/' + digest +
                '/publications'
              ),
              json: true
            }, function (error, response, data) {
              done(error, data)
            })
          }
        }), function (error, data) {
          if (error) return done(error)
          var flattened = data
            .reduce(function (flattened, element) {
              return flattened.concat(element)
            }, [])
          done(null, flattened)
        })
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
  ${publisherLink(publisher)} /
  ${escape(project)}
</header>
<main>
<article>
  <section>
  <h2>Editions</h2>
  <ul>
    ${data.publications.map(function (publication) {
      var href = (
        '/' + encodeURIComponent(publisher) +
        '/' + encodeURIComponent(project) +
        '/' + encodeURIComponent(publication)
      )
      return html`<li>
        <a href="${href}">
          ${escape(reviewersEditionSpell(publication))}
          (${escape(publication)})
        </a>
      </li>`
    })}
  </ul>
</section>
${renderDependents(data.dependents)}
</article>
</main>
${footer()}
    `)
  })
}

function renderDependents (dependents) {
  if (dependents.length === 0) return ''
  return html`
    <section>
      <h2>Dependent Projects</h2>
        <ul>${dependents.map(function (dependent) {
        return `
          ${publisherLink(dependent.publisher)}’s
          ${projectLink(dependent)}
          ${editionLink(dependent)}
        `
      })}</ul>
    </section>
  `
}
