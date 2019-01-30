var dependentsRepositoryPath = require('../paths/repository/dependents')
var descriptionRepositoryPath = require('../paths/repository/description')
var escape = require('../util/escape')
var formPublicationsRepositoryPath = require('../paths/repository/form-publications')
var get = require('simple-get')
var internalError = require('./internal-error')
var linkify = require('../util/linkify')
var longDate = require('../util/long-date')
var methodNotAllowed = require('./method-not-allowed')
var projectFrontEndPath = require('../paths/front-end/project')
var publicationFrontEndPath = require('../paths/front-end/publication')
var publicationRepositoryPath = require('../paths/repository/publication')
var publicationsRepositoryPath = require('../paths/repository/publications')
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

module.exports = function (request, response) {
  if (request.method !== 'GET') {
    return methodNotAllowed.apply(null, arguments)
  }
  var publisher = sanitize(request.params.publisher)
  var project = sanitize(request.params.project)
  runAuto({
    description: function (done) {
      get.concat({
        url: 'https://' + process.env.REPOSITORY + descriptionRepositoryPath(publisher, project),
        json: true
      }, function (error, response, description) {
        if (error) return done(error)
        done(null, description)
      })
    },
    publications: function (done) {
      get.concat({
        url: 'https://' + process.env.REPOSITORY + publicationsRepositoryPath(publisher, project),
        json: true
      }, function (error, response, publications) {
        if (error) return done(error)
        runParallel(
          publications
            .sort(reviewersEditionCompare)
            .reverse()
            .map(function (edition) {
              return function (done) {
                get.concat({
                  url: 'https://' + process.env.REPOSITORY + publicationRepositoryPath(
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
        url: 'https://' + process.env.REPOSITORY + dependentsRepositoryPath(publisher, project),
        json: true
      }, function (error, response, dependents) {
        if (error) return done(error)
        runParallel(dependents.map(function (dependent) {
          var digest = dependent.digest
          return function (done) {
            get.concat({
              url: 'https://' + process.env.REPOSITORY + formPublicationsRepositoryPath(digest),
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
    data.publisher = publisher
    data.project = project
    if (error) {
      return internalError(request, response, error)
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
    var title = publisher + '’s ' + project
    var metadata = {
      title,
      description: 'form project on ' + process.env.DOMAIN
    }
    response.end(html`
    ${preamble(title, metadata)}
<header>
  <a href=/>${escape(process.env.DOMAIN)}</a> /
  ${publisherLink(publisher)} /
  ${escape(project)}
</header>
<main>
<article>
  <section>
    ${data.description && renderDescription(data.description)}
  </section>
  <section>
    <h2>Editions</h2>
    <ul class=editionsList>${editionsList}</ul>
  </section>
  <section class=hint>
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
  <section>
    <h2>For the Publisher</h2>
    ${renderDescriptionForm(data)}
  </section>
</article>
</main>
${footer()}
    `)
  })
}

function renderDescription (description) {
  if (!description) return ''
  return html`<p>${linkify(escape(description))}</p>`
}

function renderDescriptionForm (data) {
  var action = projectFrontEndPath(data.publisher, data.project) + '/description'
  return html`
    <form method=POST action="${action}">
      <input name=project type=hidden value="${escape(data.project)}">
      <input name=publisher type=text readonly value="${escape(data.publisher)}">
      <input name=password type=password required placeholder="Password">
      <input name=description type=text required placeholder="Project Description">
      <button type=submit>Set Project Description</button>
    </form>
  `
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
