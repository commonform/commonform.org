var projectLink = require('./project-link')
var editionLink = require('./edition-link')
var publisherLink = require('./publisher-link')

module.exports = function (publication) {
  return [
    publisherLink(publication.publisher),
    projectLink(publication),
    editionLink(publication)
  ].join('/')
}
