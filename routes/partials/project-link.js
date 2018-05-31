var escape = require('../../util/escape')
var projectFrontEndPath = require('../../paths/front-end/project')

module.exports = function (publication) {
  var href = projectFrontEndPath(publication)
  return `<a href="${href}">${escape(publication.project)}</a>`
}
