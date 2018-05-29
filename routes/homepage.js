var escape = require('../util/escape')
var get = require('simple-get')
var internalError = require('./internal-error')
var methodNotAllowed = require('./method-not-allowed')
var runParallel = require('run-parallel')

var footer = require('./partials/footer')
var html = require('./html')
var preamble = require('./partials/preamble')

module.exports = function (configuration, request, response) {
  if (request.method !== 'GET') {
    return methodNotAllowed.apply(null, arguments)
  }
  runParallel({
    publishers: function (done) {
      get.concat({
        url: configuration.api + '/publishers',
        json: true
      }, function (error, response, json) {
        if (error) return done(error)
        done(null, json.sort())
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
  <h1>Common Form</h1>
  <p>a free, open repository of legal forms.</p>
</header>
<nav role=navigation>
  <a href=/edit>Write a New Form</a>
</nav>
<main>
  <article>
    ${publishersList(data.publishers)}
  </article>
</main>
${footer()}
    `)
  })
}

function publishersList (publishers) {
  return html`
<section>
  <h2>Browse by Publisher</h2>
  <ul class=publishers>${publishers.map(publisherLI)}</ul>
</section>`
}

function publisherLI (publisher) {
  return html`<li>${publisherLink(publisher)}</li>`
}

function publisherLink (publisher) {
  return html`<a href="/${escape(publisher)}">${escape(publisher)}</a>`
}
