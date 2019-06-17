var Busboy = require('busboy')
var commonmark = require('commonform-commonmark')
var escape = require('../util/escape')
var get = require('simple-get')
var https = require('https')
var internalError = require('./internal-error')
var methodNotAllowed = require('./method-not-allowed')
var publicationRepositoryPath = require('../paths/repository/publication')
var pump = require('pump')
var runAuto = require('run-auto')
var runSeries = require('run-series')
var simpleConcat = require('simple-concat')

var footer = require('./partials/footer')
var html = require('./html')
var preamble = require('./partials/preamble')

var DEFAULT_FORM = { content: ['Click to change text.'] }

module.exports = function (request, response) {
  if (request.method === 'GET') {
    return getResponse(request, response, request.query)
  } else if (request.method === 'POST') {
    return postResponse(request, response)
  } else {
    return methodNotAllowed.apply(null, arguments)
  }
}

function getResponse (request, response, parameters) {
  var digest = parameters.from
  var publisher = parameters.publisher
  var project = parameters.project
  var edition = parameters.edition
  var tasks = {
    publishers: function (done) {
      get.concat({
        url: 'https://' + process.env.REPOSITORY + '/publishers',
        json: true
      }, function (error, response, data) {
        done(error, data)
      })
    }
  }
  if (digest) {
    tasks.form = function (done) {
      get.concat({
        url: 'https://' + process.env.REPOSITORY + '/forms/' + digest,
        json: true
      }, function (error, response, data) {
        done(error, data)
      })
    }
  } else if (publisher && project && edition) {
    tasks.publication = function (done) {
      if (digest) return done(null, { digest })
      if (!publisher) return done()
      get.concat({
        url: 'https://' + process.env.REPOSITORY + publicationRepositoryPath(publisher, project, edition),
        json: true
      }, function (error, response, data) {
        done(error, data)
      })
    }
    tasks.form = ['publication', function (data, done) {
      if (!data.publication) return done()
      get.concat({
        url: 'https://' + process.env.REPOSITORY + '/forms/' + data.publication.digest,
        json: true
      }, function (error, response, data) {
        done(error, data)
      })
    }]
  }
  runAuto(tasks, function (error, data) {
    if (error) {
      return internalError(request, response, error)
    }
    response.statusCode = parameters.statusCode || 200
    response.setHeader('Content-Type', 'text/html; charset=UTF-8')
    var form = data.form || DEFAULT_FORM

    var publication = data.publication

    var flash
    if (parameters.flash) flash = `<p class=error>${escape(parameters.flash)}</p>`
    else flash = ''

    var markup
    if (parameters.markup) markup = parameters.markup
    else markup = commonmark.stringify(form)

    var signaturePages
    if (parameters.signaturePages) signaturePages = parameters.signaturePages
    else if (publication && publication.signaturePages) signaturePages = publication.signaturePages
    else signaturePages = ''

    response.end(html`
    ${preamble()}
  <main>
    ${flash}
    <form method=POST action=/edit>
      <textarea id=editor name=markup class=editor>${markup}</textarea>
      <p>
        Typing Reference:
        <a
          href=https://type.commonform.org
          target=_blank>type.commonform.org</a>
      </p>
      <p>
        <input
          name=publisher
          type=text
          autocomplete=username
          placeholder="Publisher Name"
          value="${publication ? escape(publication.publisher) : ''}"
          required>
        <input
          name=password
          type=password
          autocomplete=current-password
          placeholder=Password
          required>
      </p>
      <p>
        <input
          name=project
          type=text
          placeholder="${(publication ? escape(publication.project) : 'Project Name') + ' (optional)'}">
        <input
          name=edition
          type=text
          placeholder="Edition (optional)">
      </p>
      <p>
        <input
          name=title
          type=text
          placeholder="${(publication ? escape(publication.title) : 'Title') + ' (optional)'}">
      </p>
      <label for=notes>Release Notes</label>
      <textarea id=notes name=notes></textarea>
      <label id=signaturePages for=signaturePages>Signature Pages (JSON)</label>
      <textarea name=signaturePages>${signaturePages}</textarea>
      <p>
        <label>
          <input name=subscribe type=checkbox checked>
          Subscribe
        </label>
      </p>
      <p>
        <input type=submit value=Submit>
      </p>
    </form>
  </main>
  ${footer('/editor.bundle.js')}
    `)
  })
}

function postResponse (request, response) {
  var fields = [
    'markup',
    'signaturePages',
    'publisher',
    'password',
    'project',
    'edition',
    'title',
    'subscribe',
    'notes'
  ]
  var data = {}
  pump(
    request,
    new Busboy({ headers: request.headers })
      .on('field', function (name, value) {
        if (value && fields.includes(name)) {
          data[name] = value.trim().replace(/\r\n/g, '\n')
        }
      })
      .once('finish', function () {
        try {
          var form = commonmark.parse(data.markup).form
        } catch (error) {
          return fail('invalid markup')
        }

        try {
          var signaturePages = JSON.parse(
            data.signaturepages || 'null'
          )
        } catch (error) {
          return fail('invalid JSON signature pages')
        }

        var host = process.env.REPOSITORY
        var publisher = data.publisher
        var password = data.password
        var project = data.project
        var edition = data.edition
        var title = data.title
        var notes = data.notes
        var auth = publisher + ':' + password
        var digest

        runSeries([
          save,
          subscribe,
          publish
        ], function (error) {
          if (error) return fail(error)
          response.statusCode = 303
          response.setHeader('Location', '/forms/' + digest)
          response.end()
        })

        function save (done) {
          https.request({
            method: 'POST',
            host,
            path: '/forms',
            headers: { 'Content-Type': 'application/json' },
            auth
          })
            .once('response', function (response) {
              var statusCode = response.statusCode
              if (statusCode === 204 || statusCode === 201) {
                digest = response.headers.location.replace('/forms/', '')
                done()
              } else if (statusCode === 401) {
                return done('invalid publisher name or password')
              } else {
                request.log.error({ statusCode, path: '/forms' })
                // Read the error message.
                simpleConcat(response, function (error, buffer) {
                  if (error) return done(error)
                  done('Error: ' + buffer.toString())
                })
              }
            })
            .end(JSON.stringify(form))
        }

        function subscribe (done) {
          if (!data.subscribe) return done()
          var path = `/forms/${digest}/subscribers/${publisher}`
          https.request({
            method: 'POST',
            host,
            path,
            auth
          })
            .once('response', function (response) {
              var statusCode = response.statusCode
              // Eat any error.
              if (statusCode !== 204 && statusCode === 201) {
                request.log.error({ statusCode, path })
              }
              done()
            })
            .end()
        }

        function publish (done) {
          if (!project) return done()
          var path = `/publishers/${publisher}/projects/${project}/publications/${edition}`
          var body = { digest }
          if (notes) body.notes = notes.split(/(\r?\n){2}/)
          if (title) body.title = title.trim()
          if (signaturePages) body.signaturePages = signaturePages
          https.request({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            host,
            path,
            auth
          })
            .once('response', function (response) {
              var statusCode = response.statusCode
              if (statusCode === 204 || statusCode === 201) {
                return done()
              } else {
                request.log.error({ statusCode, path })
                // Read the error message.
                simpleConcat(response, function (error, buffer) {
                  if (error) return done(error)
                  done(buffer.toString())
                })
              }
            })
            .end(JSON.stringify(body))
        }

        function fail (error) {
          error = typeof error === 'string'
            ? error : error.toString()
          // TODO: Distinguish 401s and 500s.
          // TODO: Show edit form with bad markup, signaturePages, and flash.
          getResponse(request, response, {
            statusCode: 400,
            flash: error,
            markup: data.markup,
            signaturePages: data.siganturePages,
            publisher,
            project,
            edition
          })
        }
      })
  )
}
