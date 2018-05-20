var methodNotAllowed = require('./method-not-allowed')

var footer = require('./partials/footer')
var html = require('./html')
var preamble = require('./partials/preamble')

module.exports = function (configuration, request, response) {
  if (request.method !== 'GET') {
    return methodNotAllowed.apply(null, arguments)
  }
  response.setHeader('Content-Type', 'text/html; charset=UTF-8')
  response.end(html`
  ${preamble()}
<main>
<textarea></textarea>
</main>
${footer()}
  `)
}
