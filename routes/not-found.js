var escape = require('../util/escape')

var footer = require('./partials/footer')
var html = require('./html')
var preamble = require('./partials/preamble')

module.exports = function notFound (
  configuration, request, response, message
) {
  response.statusCode = 404
  response.setHeader('Content-Type', 'text/html')
  response.end(html`
${preamble('Not Found')}
<main>
  <h2>Not Found</h2>
  ${message.map(function (string) {
    return html`<p>${escape(string)}</p>`
  })}
</main>
${footer()}`)
}
