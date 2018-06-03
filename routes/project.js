var dependentsAPIPath = require('../paths/api/dependents')
var escape = require('../util/escape')
var get = require('simple-get')
var internalError = require('./internal-error')
var longDate = require('../util/long-date')
var methodNotAllowed = require('./method-not-allowed')
var publicationAPIPath = require('../paths/api/publication')
var publicationFrontEndPath = require('../paths/front-end/publication')
var publicationsAPIPath = require('../paths/api/publications')
var reviewersEditionCompare = require('reviewers-edition-compare')
var reviewersEditionSpell = require('reviewers-edition-spell')
var runAuto = require('run-auto')
var runParallel = require('run-parallel')
var sanitize = require('../util/sanitize')

var footer = require('./partials/footer')
var html = require('./html')
var preamble = require('./partials/preamble')
var publisherLink = require('./partials/publisher-link')
var publicationLink = require('./partials/publication-link')

module.exports = function (configuration, request, response) {
  if (request.method !== 'GET') {
    return methodNotAllowed.apply(null, arguments)
  }
  var publisher = sanitize(request.params.publisher)
  var project = sanitize(request.params.project)
  var API = configuration.api
  runAuto({
    publications: function (done) {
      get.concat({
        url: API + publicationsAPIPath(publisher, project),
        json: true
      }, function (error, response, publications) {
        if (error) return done(error)
        runParallel(
          publications
            .sort(reviewersEditionCompare)
            .map(function (edition) {
              return function (done) {
                get.concat({
                  url: API + publicationAPIPath(
                    publisher, project, edition
                  ),
                  json: true
                }, function (error, response, publication) {
                  done(error, publication)
                })
              }
            }),
          done
        )
      })
    },
    dependents: function (done) {
      get.concat({
        url: API + dependentsAPIPath(publisher, project),
        json: true
      }, function (error, response, dependents) {
        if (error) return done(error)
        runParallel(dependents.map(function (dependent) {
          var digest = dependent.digest
          return function (done) {
            get.concat({
              url: API + publicationsAPIPath(digest),
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
    var editionsList = data.publications.map(function (publication, index) {
      var href = publicationFrontEndPath(
        publisher, project, publication.edition
      )
      return html`<li>
        <p>
          <a href="${href}">
            ${escape(reviewersEditionSpell(publication.edition))}
            (${escape(publication.edition)})
          </a>
          ${publication.timestamp && timestamp()}
          ${index !== 0 && comparisonLink()}
        </p>
        ${publication.notes && releaseNotes(publication.notes)}
      </li>`
      function releaseNotes (notes) {
        return notes.map(function (line) {
          return html`<p class=releaseNotes>${escape(line)}</p>`
        })
      }
      function timestamp () {
        return ' — ' + longDate(new Date(publication.timestamp))
      }
      function comparisonLink () {
        var prior = data.publications[index - 1]
        return `
          —
          <a href="/compare/${prior.digest}/${publication.digest}">
            redline
          </a>
        `
      }
    })
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
    <ul class=editionsList>${editionsList}</ul>
  </section>
  <section class=hint>
    <h2>About Editions</h2>
    <p>
      Common Form publishers use the
      <a href=https://reviewersedition.org>Reviewers Edition</a>
      system to number succeeding versions of their projects.
      Reviewers Edition numbers give document authors a simple,
      clear, and concise way to tell document users how much has
      changed, and what they should review, as documents evolve
      over time.
    </p>
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
  var items = dependents.map(function (dependent) {
    return `<li>${publicationLink(dependent)}</li>`
  })
  return html`
    <section>
      <h2>Dependent Projects</h2>
      <ul>${items}</ul>
    </section>
  `
}
