var escape = require('../../util/escape')

module.exports = function (publication) {
  var href = (
    '/' + encodeURIComponent(publication.publisher) +
    '/' + encodeURIComponent(publication.project) +
    '/' + encodeURIComponent(publication.edition)
  )
  return `<a href="${href}">${escape(publication.project)} ${escape(publication.edition)}</a>`
}
