var publicationFrontEndPath = require('../../paths/front-end/publication')
var escape = require('../../util/escape')

module.exports = function (publication) {
  var href = publicationFrontEndPath(
    publication.publisher,
    publication.project,
    publication.edition
  )
  return `<a href="${href}">${escape(publication.edition)}</a>`
}
