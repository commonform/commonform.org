var DOCX_CONTENT_TYPE = require('docx-content-type')
var DOCX_OPTIONS = require('../docx-options')
var docx = require('commonform-docx')
var escape = require('../util/escape')
var get = require('simple-get')
var internalError = require('./internal-error')
var loadComponents = require('commonform-load-components')
var methodNotAllowed = require('./method-not-allowed')
var notFound = require('./not-found')
var publicationFrontEndPath = require('../paths/front-end/publication')
var publicationRepositoryPath = require('../paths/repository/publication')
var publicationsRepositoryPath = require('../paths/repository/publications')
var querystring = require('querystring')
var reviewersEditionCompare = require('reviewers-edition-compare')
var reviewersEditionUpgrade = require('reviewers-edition-upgrade')
var runAuto = require('run-auto')
var sanitize = require('../util/sanitize')
var signaturePagesToOOXML = require('ooxml-signature-pages')

var footer = require('./partials/footer')
var lockedHint = require('./partials/locked-hint')
var form = require('./partials/form')
var html = require('./html')
var preamble = require('./partials/preamble')
var projectLink = require('./partials/project-link')
var publisherLink = require('./partials/publisher-link')

module.exports = function (request, response) {
  if (request.method !== 'GET') {
    return methodNotAllowed.apply(null, arguments)
  }
  var edition = sanitize(request.params.edition)
  if (edition === 'current' || edition === 'latest') {
    return redirect.apply(this, arguments)
  }
  var publisher = sanitize(request.params.publisher)
  var project = sanitize(request.params.project)
  runAuto({
    publication: function (done) {
      get.concat({
        url: 'https://' + process.env.REPOSITORY + publicationRepositoryPath(publisher, project, edition),
        json: true
      }, function (error, response, data) {
        done(error, data)
      })
    },
    project: function (done) {
      get.concat({
        url: 'https://' + process.env.REPOSITORY + publicationsRepositoryPath(publisher, project),
        json: true
      }, function (error, response, data) {
        done(error, data.sort(reviewersEditionCompare))
      })
    },
    form: ['publication', function (data, done) {
      get.concat({
        url: 'https://' + process.env.REPOSITORY + '/forms/' + data.publication.digest,
        json: true
      }, function (error, response, form) {
        done(error, form)
      })
    }],
    loaded: ['form', function (data, done) {
      var clone = JSON.parse(JSON.stringify(data.form))
      loadComponents(clone, {}, function (error, form, resolutions) {
        if (error) return done(error)
        done(null, {form, resolutions})
      })
    }]
  }, function (error, data) {
    if (error) {
      return internalError(request, response, error)
    }
    var publication = data.publication
    if (request.query.format === 'docx') {
      var options = Object.assign(
        {},
        DOCX_OPTIONS,
        {
          title: publication.title || publication.project,
          edition: publication.edition
        }
      )
      if (publication.signaturePages) {
        options.after = signaturePagesToOOXML(publication.signaturePages)
      }
      response.setHeader('Content-Type', DOCX_CONTENT_TYPE)
      response.setHeader(
        'Content-Disposition',
        `attachment; filename="${publication.project} ${publication.edition}.docx"`
      )
      response.end(
        docx(data.loaded.form, [], options).generate({type: 'nodebuffer'})
      )
      return
    } else if (request.query.format === 'json') {
      response.setHeader('Content-Type', 'application/json')
      response.setHeader(
        'Content-Disposition',
        `attachment; filename="${publication.project} ${publication.edition}.json"`
      )
      var combined = Object.assign(
        {},
        data.publication,
        {form: data.form, loaded: data.loaded}
      )
      response.end(JSON.stringify(combined))
      return
    }
    var formOptions = {publisher, project, edition}
    response.setHeader('Content-Type', 'text/html; charset=UTF-8')
    var publicationHREF = publicationFrontEndPath(
      publisher, project, edition
    )
    var docxHREF = publicationHREF + '?format=docx'
    var jsonHREF = publicationHREF + '?format=json'
    var editHREF = '/edit?' + querystring.stringify({
      publisher, project, edition
    })
    response.end(html`
    ${preamble()}
<header>
  <a href=/>${escape(process.env.DOMAIN)}</a> /
  ${publisherLink(publisher)} /
  ${projectLink(data.publication)} /
  ${escape(edition)}
</header>
<main>
  <article>
    ${editionWarnings(edition, data.project)}
    ${lockedHint(data.form)}
    <a class="button docx" href="${docxHREF}">Download .docx</a>
    <a class=button href="${jsonHREF}">Download .json</a>
    <a class=button href="${editHREF}">Edit</a>
    <a class=button href=/forms/${data.publication.digest}>Analyze</a>
    ${form(data.form, data.loaded, formOptions)}
  </article>
</main>
<script>window.publication = ${JSON.stringify(data.publication)}</script>
${footer('/download.bundle.js')}
    `)

    function editionWarnings (displaying, available) {
      var upgrades = available.filter(function (available) {
        return reviewersEditionUpgrade(displaying, available)
      })
      if (upgrades.length !== 0) {
        var upgrade = upgrades[upgrades.length - 1]
        var href = publicationFrontEndPath(
          publisher, project, upgrade
        )
        return `<p class=warn>
          A
          <a href="${href}">newer edition</a>
          of
          ${publisherLink(publisher)} /
          ${projectLink(data.publication)}
          is available.
        </p>`
      }
    }
  })
}

function redirect (request, response) {
  var params = request.params
  var publisher = sanitize(params.publisher)
  var project = sanitize(params.project)
  var edition = sanitize(params.edition)
  get.concat({
    url: 'https://' + process.env.REPOSITORY + publicationRepositoryPath(publisher, project, edition)
  }, function (error, publicationResponse, data) {
    if (error) {
      return internalError(request, response, error)
    }
    var statusCode = publicationResponse.statusCode
    if (statusCode !== 200) {
      return notFound(request, response, [
        'No current publication found.',
        'The publisher may have published only drafts so far.'
      ])
    }
    var body = JSON.parse(data)
    response.statusCode = 303
    var uri = publicationFrontEndPath(
      publisher, project, body.edition
    )
    response.setHeader('Location', uri)
    response.end()
  })
}
