var escape = require('../util/escape')

var footer = require('./partials/footer')
var html = require('./html')
var preamble = require('./partials/preamble')

module.exports = function internalError (request, response, error) {
  request.log.error(error)
  response.statusCode = 500
  response.setHeader('Content-Type', 'text/html')
  response.end(html`
${preamble('Software Error')}
<main>
  <h2>Software Error</h2>
  <p>
    There&rsquo;s been a problem with the server.
  </p>
  <p>
    Please include the special code ${escape(request.id)} in any
    correspondence about this issue.
  </p>
</main>
${footer()}`)
}
