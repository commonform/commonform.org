var get = require('simple-get')
var internalError = require('./internal-error')
var methodNotAllowed = require('./method-not-allowed')
var publicationRepositoryPath = require('../paths/repository/publication')
var runAuto = require('run-auto')

var footer = require('./partials/footer')
var html = require('./html')
var preamble = require('./partials/preamble')

var DEFAULT_FORM = { content: ['Click to change text.'] }

module.exports = function (request, response) {
  if (request.method === 'GET') {
    return getResponse.apply(this, arguments)
  } else {
    return methodNotAllowed.apply(null, arguments)
  }
}

function getResponse (request, response) {
  var digest = request.query.from
  var publisher = request.query.publisher
  var project = request.query.project
  var edition = request.query.edition
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
    response.setHeader('Content-Type', 'text/html; charset=UTF-8')
    response.end(html`
    ${preamble()}
  <main id=editor class=editor>
    <noscript>
      <p>Your web browser has JavaScript disabled.</p>
      <p>To edit forms, you must enable JavaScript.</p>
    </noscript>
  </main>
  <script>window.domain = ${JSON.stringify(process.env.DOMAIN)}</script>
  <script>window.repository = ${JSON.stringify(process.env.REPOSITORY)}</script>
  <script>window.form = ${JSON.stringify(data.form || DEFAULT_FORM)}</script>
  <script>window.publishers = ${JSON.stringify(data.publishers)}</script>
  <script>window.publication = ${JSON.stringify(data.publication || {})}</script>
  ${footer('/editor.bundle.js')}
    `)
  })
}
