var DOCX_CONTENT_TYPE = require('docx-content-type')
var DOCX_OPTIONS = require('../docx-options')
var annotate = require('../util/annotate')
var docx = require('commonform-docx')
var formFrontEndPath = require('../paths/front-end/form')
var get = require('simple-get')
var internalError = require('./internal-error')
var loadComponents = require('commonform-load-components')
var commonmark = require('commonform-commonmark')
var methodNotAllowed = require('./method-not-allowed')
var notFound = require('./not-found')
var runAuto = require('run-auto')
var sanitize = require('../util/sanitize')

var footer = require('./partials/footer')
var form = require('./partials/form')
var html = require('./html')
var lockedHint = require('./partials/locked-hint')
var preamble = require('./partials/preamble')
var publicationLink = require('./partials/publication-link')

module.exports = function (request, response) {
  if (request.method !== 'GET') {
    return methodNotAllowed.apply(null, arguments)
  }
  var digest = sanitize(request.params.digest)
  runAuto({
    form: function (done) {
      get.concat({
        url: 'https://' + process.env.REPOSITORY + '/forms/' + digest,
        json: true
      }, function (error, response, form) {
        var statusCode = response.statusCode
        if (statusCode !== 200) {
          var newError = new Error('server responded ' + statusCode)
          newError.statusCode = statusCode
          return done(newError)
        }
        done(error, form)
      })
    },
    loaded: ['form', function (data, done) {
      loadComponents(data.form, {}, function (error, form, resolutions) {
        if (error) return done(error)
        done(null, { form, resolutions })
      })
    }],
    publications: function (done) {
      get.concat({
        url: 'https://' + process.env.REPOSITORY + '/forms/' + digest + '/publications',
        json: true
      }, function (error, response, data) {
        var statusCode = response.statusCode
        if (statusCode !== 200) {
          var newError = new Error('server responded ' + statusCode)
          newError.statusCode = statusCode
          return done(newError)
        }
        done(error, data)
      })
    },
    comments: function (done) {
      get.concat({
        url: (
          'https://' + process.env.REPOSITORY +
          '/annotations?context=' + digest
        ),
        json: true
      }, function (error, response, data) {
        var statusCode = response.statusCode
        if (statusCode !== 200) {
          var newError = new Error('server responded ' + statusCode)
          newError.statusCode = statusCode
          return done(newError)
        }
        done(error, data)
      })
    }
  }, function (error, data) {
    if (error) {
      if (error.statusCode === 404) {
        return notFound(request, response,
          [
            'The server does not have a form ' +
            'with that ID.'
          ]
        )
      }
      return internalError(request, response, error)
    }
    if (request.query.format === 'docx') {
      let options = Object.assign(
        {}, DOCX_OPTIONS, { digest: digest }
      )
      response.setHeader('Content-Type', DOCX_CONTENT_TYPE)
      response.setHeader(
        'Content-Disposition',
        `attachment; filename="${digest}.docx"`
      )
      response.end(
        docx(data.loaded.form, [], options).generate({ type: 'nodebuffer' })
      )
      return
    } else if (request.query.format === 'md') {
      let options = { digest: digest }
      response.setHeader('Content-Type', 'text/plain')
      response.setHeader(
        'Content-Disposition',
        `attachment; filename="${digest}.md"`
      )
      response.end(commonmark.stringify(data.loaded.form, [], options))
      return
    } else if (request.query.format === 'json') {
      response.setHeader('Content-Type', 'application/json')
      response.setHeader(
        'Content-Disposition',
        `attachment; filename="${digest}.json"`
      )
      response.end(JSON.stringify(data.form))
      return
    }
    response.setHeader('Content-Type', 'text/html; charset=UTF-8')
    var options = {
      comments: data.comments,
      commentUI: true,
      annotations: annotate(data.loaded.form),
      childLinks: true
    }
    var formHREF = formFrontEndPath(digest)
    var docxHREF = formHREF + '?format=docx'
    var mdHREF = formHREF + '?format=md'
    var jsonHREF = formHREF + '?format=json'
    response.end(html`
    ${preamble()}
<header>
  <a href=/>${escape(process.env.DOMAIN)}</a> /
  <span class=digest>${digest}</span>
</header>
<main>
  ${lockedHint(data.form)}
  <header>
    <a class="button docx" href="${docxHREF}">Download .docx</a>
    <a class="button markdown" href="${mdHREF}">Download .md</a>
    <a class=button href="${jsonHREF}">Download .json</a>
    <a class=button href=/edit?from=${digest}>Edit</a>
  </header>
  <header>
    ${publicationsSection(data.publications)}
    ${publishedWithinSection(data.publications)}
  </header>
  ${form(data.form, data.loaded, options)}
</main>
<script>window.digest = ${JSON.stringify(digest)}</script>
${footer('/comments.js', '/download.bundle.js')}
    `)
  })
}

function publicationsSection (publications) {
  var roots = publications.filter(function (publication) {
    return publication.root
  })
  if (roots.length === 0) return ''
  return html`
    <section class=publications>
    <p>This form has been published as:</p>
    <ul>${roots.map(publicationLI)}</ul>
    </section>
  `
}

function publishedWithinSection (publications) {
  var notRoots = publications.filter(function (publication) {
    return !publication.root
  })
  if (notRoots.length === 0) return ''
  return html`
    <section class=publications>
    <p>This form has been published as part of:</p>
    <ul>${notRoots.map(publicationLI)}</ul>
    </section>
  `
}

function publicationLI (publication) {
  return `<li>${publicationLink(publication)}</li>`
}
