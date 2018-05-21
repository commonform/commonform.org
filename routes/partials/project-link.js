var escape = require('../../util/escape')

module.exports = function (publication) {
  var href = (
    '/' + encodeURIComponent(publication.publisher) +
    '/' + encodeURIComponent(publication.project)
  )
  return `<a href="${href}">${escape(publication.project)}</a>`
}
