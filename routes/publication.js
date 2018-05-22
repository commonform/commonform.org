var DOCX_CONTENT_TYPE = require('docx-content-type')
var docx = require('commonform-docx')
var escape = require('../util/escape')
var get = require('simple-get')
var internalError = require('./internal-error')
var loadComponents = require('commonform-load-components')
var methodNotAllowed = require('./method-not-allowed')
var outlineNumbering = require('outline-numbering')
var reviewersEditionCompare = require('reviewers-edition-compare')
var reviewersEditionSpell = require('reviewers-edition-spell')
var reviewersEditionUpgrade = require('reviewers-edition-upgrade')
var runAuto = require('run-auto')
var sanitize = require('../util/sanitize')
var signaturePagesToOOXML = require('ooxml-signature-pages')

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
    project: function (done) {
      get.concat({
        url: (
          configuration.api +
          '/publishers/' + encodeURIComponent(publisher) +
          '/projects/' + encodeURIComponent(project) +
          '/publications'
        ),
        json: true
      }, function (error, response, data) {
        done(error, data.sort(reviewersEditionCompare))
      })
    },
    form: ['publication', function (data, done) {
      get.concat({
        url: configuration.api + '/forms/' + data.publication.digest,
        json: true
      }, function (error, response, form) {
        done(error, form)
      })
    }],
    loaded: ['form', function (data, done) {
      loadComponents(data.form, {}, done)
    }]
  }, function (error, data) {
    if (error) {
      return internalError(configuration, request, response, error)
    }
    if (request.query.format === 'docx') {
      var publication = data.publication
      var options = {
        title: publication.project,
        edition: publication.edition,
        markFilled: true,
        numbering: outlineNumbering
      }
      if (publication.signaturePages) {
        options.after = signaturePagesToOOXML(publication.signaturePages)
      }
      response.setHeader('Content-Type', DOCX_CONTENT_TYPE)
      response.setHeader(
        'Content-Disposition',
        `attachment; filename="${publication.project} ${publication.edition}.docx"`
      )
      response.end(
        docx(data.loaded, [], options).generate({type: 'nodebuffer'})
      )
      return
    }
    response.setHeader('Content-Type', 'text/html; charset=UTF-8')
    var docxHREF = (
      '/' + encodeURIComponent(publisher) +
      '/' + encodeURIComponent(project) +
      '/' + encodeURIComponent(edition) +
      '?format=docx'
    )
    response.end(html`
    ${preamble()}
<header>
  <h1>
    ${publisherLink(publisher)}’s
    ${projectLink(data.publication)}
  </h1>
  <p class=edition>
    ${escape(reviewersEditionSpell(edition))}
  </p>
  ${editionWarnings(edition, data.project)}
  <p>
    Common Form ID:
    <a class=digest href=/forms/${data.publication.digest}>${data.publication.digest}</a>
  </p>
  <a href="${docxHREF}">Download .docx</a>
  <a href=/edit?from=${data.publication.digest}>Edit</a>
</header>
<main>${form(data.form, data.loaded)}</main>
<script>window.publication = ${JSON.stringify(data.publication)}</script>
${footer()}
    `)

    function editionWarnings (displaying, available) {
      var upgrades = available.filter(function (available) {
        return reviewersEditionUpgrade(displaying, available)
      })
      if (upgrades.length !== 0) {
        var upgrade = upgrades[upgrades.length - 1]
        var href = (
          '/' + encodeURIComponent(publisher) +
          '/' + encodeURIComponent(project) +
          '/' + encodeURIComponent(upgrade)
        )
        return `<p class=warn>
          An
          <a href="${href}">upgraded edition</a>
          of ${publisherLink(publisher)}’s
          ${projectLink(data.publication)}
          is available.
        </p>`
      }
    }
  })
}
