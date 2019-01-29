var escape = require('../util/escape')
var get = require('simple-get')
var internalError = require('./internal-error')
var methodNotAllowed = require('./method-not-allowed')
var runParallel = require('run-parallel')

var footer = require('./partials/footer')
var html = require('./html')
var preamble = require('./partials/preamble')

module.exports = function (request, response) {
  if (request.method !== 'GET') {
    return methodNotAllowed.apply(null, arguments)
  }
  runParallel({
    publishers: function (done) {
      get.concat({
        url: 'https://' + process.env.REPOSITORY + '/publishers',
        json: true
      }, function (error, response, json) {
        if (error) return done(error)
        done(null, json.sort())
      })
    }
  }, function (error, data) {
    if (error) {
      return internalError(request, response, error)
    }
    var title = 'Common Form'
    var metadata = {
      title,
      description: 'a free, open repository of legal forms'
    }
    response.setHeader('Content-Type', 'text/html; charset=UTF-8')
    response.end(html`
    ${preamble(title, metadata)}
<header>
  <h1>Common Form</h1>
  <p>a free, open repository of legal forms</p>
</header>
<main>
  <article>
    ${publishersList(data.publishers)}
    <section>
      <h2>For Publishers</h2>
      <p><a class=button href=/edit>Write a New Form</a></p>
      <p><a class=button href="mailto:kyle@kemitchell.com?subject=Common%20Form%20Publisher%20Account">Request a Publisher Account</a></p>
    </section>
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
  <ul class=columnList>${publishers.map(publisherLI)}</ul>
</section>`
}

function publisherLI (publisher) {
  return html`<li>${publisherLink(publisher)}</li>`
}

function publisherLink (publisher) {
  return html`<a href="/${escape(publisher)}">${escape(publisher)}</a>`
}
