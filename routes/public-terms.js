var commonformHTML = require('commonform-html')
var internalError = require('./internal-error')
var longDate = require('../util/long-date')
var methodNotAllowed = require('./method-not-allowed')

var footer = require('./partials/footer')
var html = require('./html')
var preamble = require('./partials/preamble')

module.exports = function (configuration, request, response, reader, title) {
  if (request.method !== 'GET') {
    methodNotAllowed.apply(null, arguments)
    return
  }
  reader(configuration, function (error, terms) {
    if (error) return internalError(configuration, request, response, error)
    var content = commonformHTML(
      terms.commonform,
      terms.directions,
      {
        title: title,
        edition: 'Last Updated: ' + longDate(new Date(terms.updated)),
        lists: true,
        html5: true
      }
    )
    response.setHeader('Content-Type', 'text/html; charset=UTF-8')
    response.end(html`
${preamble(title)}
<main><article id=terms class=commonform>${content}</article></main>
${footer()}`)
  })
}
