var assert = require('assert')
var digestLink = require('./digest-link')
var h = require('../h')
var spell = require('reviewers-edition-spell')

module.exports = function header (
  digest, publications, toDigest, toPublications, send
) {
  assert(typeof digest === 'string')
  assert(Array.isArray(publications))
  assert(send !== undefined)
  return h('header', [
    paragraph(digest, publications, send),
    toDigest ? h('p','compared to') : null,
    toDigest ? paragraph(toDigest, toPublications, send) : null
  ])
}

function paragraph (digest, publications, send) {
  assert(typeof digest === 'string')
  assert(Array.isArray(publications))
  assert(send !== undefined)
  return h('div', [
    h('p', digestLink(digest)),
    publicationsList(publications)
  ])
}

function publicationsList (publications) {
  return h('p',
    publications.map(function (publication) {
      return publicationLine(publication)
    })
  )
}

function publicationLine (publication) {
  var edition = publication.edition
  var project = publication.project
  var publisher = publication.publisher
  var link = `/publications/${publisher}/${project}/${edition}`
  return h('p.publication', [
    h('a.publisher', {
      href: '/publishers/' + encodeURIComponent(publisher)
    }, publisher),
    h('span', [
      ' published this form ',
      publication.root ? 'as' : 'within',
      ' '
    ]),
    h('strong',
      h('a', {
        href: link,
        title: (
          'Read ' + publisher + '\'s ' + project + ' ' + spell(edition)
        )
      }, project),
      h('abbr', {title: spell(edition)}, edition)
    )
  ])
}
